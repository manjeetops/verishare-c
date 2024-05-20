package com.deqode.flows.organization

import co.paralleluniverse.fibers.Suspendable
import com.deqode.contracts.OrganizationInfoContract
import com.deqode.schemas.OrganizationStatus
import com.deqode.service.organizationService
import com.deqode.states.OrganizationInfoState
import net.corda.core.contracts.StateAndRef
import net.corda.core.flows.*
import net.corda.core.transactions.SignedTransaction
import net.corda.core.transactions.TransactionBuilder
import net.corda.core.utilities.ProgressTracker
import java.security.PublicKey
import java.util.*


@InitiatingFlow
@StartableByRPC
class UpdateOrganizationFlow(private val status: OrganizationStatus) :
        FlowLogic<SignedTransaction>() {
    companion object {
        object GENERATING_INPUTS : ProgressTracker.Step("Generating Required Inputs")
        object GENERATING_OUTPUTS : ProgressTracker.Step("Generating Required Outputs")
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction")
        object SIGNING_TRANSACTION : ProgressTracker.Step("Verifying and " +
                "Signing transaction with " +
                "Node private key.")

        object FINALISING_TRANSACTION : ProgressTracker.Step("Obtaining notary signature and recording transaction.") {
            override fun childProgressTracker() = FinalityFlow.tracker()
        }

        fun tracker() = ProgressTracker(
                GENERATING_INPUTS,
                GENERATING_OUTPUTS,
                GENERATING_TRANSACTION,
                SIGNING_TRANSACTION,
                FINALISING_TRANSACTION
        )
    }

    override val progressTracker = tracker()

    @Suspendable
    override fun call(): SignedTransaction {

        //Generating Inputs
        progressTracker.currentStep = GENERATING_INPUTS
        val organizationInput = generateInputs()

        //Generate Outputs
        progressTracker.currentStep = GENERATING_OUTPUTS
        val organizationOutput = generateOutputs(organizationInput.state.data, status)

        //Generating Transaction
        progressTracker.currentStep = GENERATING_TRANSACTION
        val transaction = transaction(organizationInput, organizationOutput)

        //Verifying and signing Transactions
        progressTracker.currentStep = SIGNING_TRANSACTION
        val signedTransaction = verifyAndSign(transaction, listOf(ourIdentity
                .owningKey))

        //Finalising The transaction
        progressTracker.currentStep = FINALISING_TRANSACTION
        finaliseTransaction(signedTransaction)

        return signedTransaction;

    }

    private fun generateInputs(): StateAndRef<OrganizationInfoState> {
        return organizationService.getCurrentOrganization(ourIdentity)
                ?: throw FlowException("Organization not found in this Node")
    }

    private fun generateOutputs(orgState: OrganizationInfoState, status: OrganizationStatus):
            OrganizationInfoState {
        return orgState.modifyStatus(status)
    }

    private fun transaction(inputState: StateAndRef<OrganizationInfoState>, outputState:
    OrganizationInfoState):
            TransactionBuilder {
        return TransactionBuilder(serviceHub.networkMapCache.notaryIdentities.first())
                .addInputState(inputState)
                .addOutputState(outputState, OrganizationInfoContract.ID)
                .addCommand(OrganizationInfoContract.Commands.UpdateStatus(), listOf
                (ourIdentity.owningKey))
    }

    private fun verifyAndSign(transaction: TransactionBuilder, signers: List<PublicKey>):
            SignedTransaction {
        transaction.verify(serviceHub)
        return serviceHub.signInitialTransaction(transaction, signers)
    }

    @Suspendable
    private fun finaliseTransaction(signedTransaction: SignedTransaction) {
        val everyoneButMeAndNotary = organizationService.getEveryOneButNotaryAndMe(ourIdentity)
        val sessions = everyoneButMeAndNotary.map { otherParty ->
            initiateFlow(otherParty);
        }
        subFlow(FinalityFlow(signedTransaction, sessions))
    }
}


@InitiatedBy(UpdateOrganizationFlow::class)
class UpdateOrganizationFlowResponder(private val otherPartySession: FlowSession) : FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        subFlow(ReceiveFinalityFlow(otherPartySession))
    }
}
