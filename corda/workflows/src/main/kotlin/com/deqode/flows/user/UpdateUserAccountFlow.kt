package com.deqode.flows.user

import co.paralleluniverse.fibers.Suspendable
import com.deqode.contracts.PublicUserAccountInfoContract
import com.deqode.flows.general.ShareStatesFlow
import com.deqode.schemas.UserStatus
import com.deqode.service.userService
import com.deqode.states.PublicUserAccountInfoState
import com.r3.corda.lib.accounts.workflows.accountService
import com.r3.corda.lib.accounts.workflows.flows.RequestKeyForAccount
import net.corda.core.contracts.StateAndRef
import net.corda.core.flows.FinalityFlow
import net.corda.core.flows.FlowException
import net.corda.core.flows.FlowLogic
import net.corda.core.flows.StartableByRPC
import net.corda.core.transactions.SignedTransaction
import net.corda.core.transactions.TransactionBuilder
import net.corda.core.utilities.ProgressTracker
import java.security.PublicKey
import java.util.*

@StartableByRPC
class UpdateUserAccountFlow(private val adminId: UUID,
                            private val userId: UUID,
                            private val status: UserStatus) :
        FlowLogic<SignedTransaction>() {
    companion object {
        object GENERATING_INPUTS : ProgressTracker.Step("Generating Required Inputs")
        object GENERATING_OUTPUTS : ProgressTracker.Step("Generating Required Outputs")
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction")
        object SIGNING_TRANSACTION : ProgressTracker.Step("Verifying and Signing transaction with Node " +
                "private key.")

        object FINALISING_TRANSACTION : ProgressTracker.Step("Obtaining notary signature and recording " +
                "transaction.") {
            override fun childProgressTracker() = FinalityFlow.tracker()
        }

        object BROADCAST_ACCOUNTS : ProgressTracker.Step("Broadcasting user account")

        fun tracker() = ProgressTracker(
                GENERATING_INPUTS,
                GENERATING_OUTPUTS,
                GENERATING_TRANSACTION,
                SIGNING_TRANSACTION,
                FINALISING_TRANSACTION,
                BROADCAST_ACCOUNTS
        )
    }

    override val progressTracker = tracker()

    @Suspendable
    override fun call(): SignedTransaction {

        //Querying User States from vault
        progressTracker.currentStep = GENERATING_INPUTS
        val userInput = generateInputs(userId)

        //Get admin Account
        val adminAccount = accountService.accountInfo(id = adminId) ?: throw
        FlowException("admin not found: $adminId")

        val adminState = userService.getActiveUserAccountByUserId(adminId) ?: throw FlowException("Admin not found: $adminId")

        // check user and admin should be of same org
        if(!userService.isUserAndAdminFromSameOrg(userInput.state.data, adminState.state.data))
            throw FlowException("User and admin should be present on same organization.")

        // Get admin PubKey
        val adminPubKey = subFlow(RequestKeyForAccount(adminAccount.state.data))
                .owningKey

        //Generating Outputs
        progressTracker.currentStep = GENERATING_OUTPUTS
        val userOutput = generateOutputs(userInput.state.data, adminPubKey)

        //Generating Transactions
        progressTracker.currentStep = GENERATING_TRANSACTION
        val transaction = transaction(userInput, userOutput, listOf(adminPubKey))

        //verifying and Signing the Transaction
        progressTracker.currentStep = SIGNING_TRANSACTION
        val signedTransaction = verifyAndSign(transaction, listOf(adminPubKey))

        //Finalising The transaction
        progressTracker.currentStep = FINALISING_TRANSACTION
        finaliseTransaction(signedTransaction)

        //Broadcasting the account
        progressTracker.currentStep = BROADCAST_ACCOUNTS
        broadcastAccounts(userId)

        return signedTransaction
    }

    private fun generateInputs(userId: UUID): StateAndRef<PublicUserAccountInfoState> {
        return userService.getUserAccountByUserId(userId) ?: throw FlowException("User not found: $userId")
    }

    private fun generateOutputs(userState: PublicUserAccountInfoState, adminPublicKey: PublicKey)
            : PublicUserAccountInfoState {
        return userState.updateUser(status = status, adminPublicKey = adminPublicKey)
    }

    private fun transaction(inputState: StateAndRef<PublicUserAccountInfoState>,
                            outputState: PublicUserAccountInfoState, signers: List<PublicKey>): TransactionBuilder {
        return TransactionBuilder(serviceHub.networkMapCache.notaryIdentities.first())
                .addInputState(inputState)
                .addOutputState(outputState, PublicUserAccountInfoContract.ID)
                .addCommand(PublicUserAccountInfoContract.Commands.Update(), signers)
    }

    private fun verifyAndSign(transaction: TransactionBuilder, signers: List<PublicKey>): SignedTransaction {
        transaction.verify(serviceHub)
        return serviceHub.signInitialTransaction(transaction, signers)
    }

    @Suspendable
    private fun finaliseTransaction(signedTransaction: SignedTransaction) {
        subFlow(FinalityFlow(signedTransaction, listOf()))
    }

    @Suspendable
    private fun broadcastAccounts(userId: UUID) {
        val everyone = serviceHub.networkMapCache.allNodes.flatMap { it.legalIdentities };
        val everyoneButMeAndNotary = everyone.filter { serviceHub.networkMapCache.isNotary(it).not() } - ourIdentity
        val userStateAndRef = userService.getUserAccountByUserId(userId)
                ?: throw FlowException("User not found : $userId")
        subFlow(ShareStatesFlow(everyoneButMeAndNotary, listOf(userStateAndRef)))
    }

}

