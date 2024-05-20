package com.deqode.flows.attestation

import co.paralleluniverse.fibers.Suspendable
import com.deqode.contracts.AttestationInfoContract
import com.deqode.schemas.UserRole
import com.deqode.service.documentService
import com.deqode.service.userService
import com.deqode.states.Attestation
import com.deqode.states.AttestationInfoState
import com.deqode.states.DocumentInfoState
import com.r3.corda.lib.accounts.contracts.states.AccountInfo
import com.r3.corda.lib.accounts.workflows.accountService
import com.r3.corda.lib.accounts.workflows.flows.RequestKeyForAccount
import net.corda.core.contracts.StateAndRef
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.flows.*
import net.corda.core.identity.AnonymousParty
import net.corda.core.identity.Party
import net.corda.core.transactions.SignedTransaction
import net.corda.core.transactions.TransactionBuilder
import net.corda.core.utilities.ProgressTracker
import java.security.PublicKey
import java.util.*

@InitiatingFlow
@StartableByRPC
class AttestDocumentFlow(
        private val documentId: UniqueIdentifier,
        private val userId: UUID,
        private val version: Int
) : FlowLogic<SignedTransaction>() {
    companion object {
        object GENERATING_OUTPUTS : ProgressTracker.Step("Generating Required Outputs")
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction")
        object SIGNING_TRANSACTION : ProgressTracker.Step("Verifying and Signing " +
                "transaction with Node private key.")

        object FINALISING_TRANSACTION : ProgressTracker.Step("Obtaining notary signature and recording transaction.") {
            override fun childProgressTracker() = FinalityFlow.tracker()
        }

        fun tracker() = ProgressTracker(
                GENERATING_OUTPUTS,
                GENERATING_TRANSACTION,
                SIGNING_TRANSACTION,
                FINALISING_TRANSACTION
        )
    }

    override val progressTracker = tracker()

    @Suspendable
    override fun call() : SignedTransaction {
        //Check permission
        val document = checkDocumentPermission()

        //Get the user account info
        val userAccountInfo = getUserAccountInfo(userId)
        val documentOwnerAccountInfo = getUserAccountInfo(document.ownerId)

        //Get inputs
        val input = generateInputs()

        //Get outputs
        val output = generateOutputs(input?.state?.data,
                userAccountInfo.second, listOf(userAccountInfo.second,
                documentOwnerAccountInfo.second))

        //Building the transaction
        progressTracker.currentStep = GENERATING_TRANSACTION
        val transaction = transaction(input, output, listOf(userAccountInfo.second))

        //Verifying and signing the transaction
        val signedTransaction = verifyAndSign(transaction, listOf(userAccountInfo.second))

        //Finalising The transaction
        progressTracker.currentStep = FINALISING_TRANSACTION
        finaliseTransaction(signedTransaction, output.participants)

        return signedTransaction
    }

    private fun checkDocumentPermission(): DocumentInfoState {
        val userAccountInfoState = userService.getActiveUserAccountByUserId(userId)?.state?.data
                ?: throw FlowException("User not found: $userId")
        val documentPermission = documentService.getUserPermission(documentId,
                userId, userAccountInfoState.organizationId)

        if (documentPermission.first.state.data.frozen) {
            throw FlowException("Attestation failed, Document is frozen")
        }

        if (documentPermission.first.state.data.ownerId != userId  && documentPermission
                        .second == null) {
            val ownerAccountInfoState = userService.getActiveUserAccountByUserId(documentPermission.first.state.data.ownerId)?.state?.data
                    ?: throw FlowException("Document owner not found: ${documentPermission.first.state.data.ownerId}")
            if (userAccountInfoState.role != UserRole.ADMIN || ownerAccountInfoState
                            .organizationId != userAccountInfoState.organizationId)
                throw FlowException("You don't have permission to attest this document")
        }

        if (version > documentPermission.first.state.data.version || version < 1) {
            throw FlowException("Version of the document not found: $version")
        }
        return documentPermission.first.state.data
    }

    private fun getUserAccountInfo(userId: UUID): Pair<StateAndRef<AccountInfo>,
            PublicKey> {
        val userAccountInfo = accountService.accountInfo(userId)
                ?: throw IllegalStateException("Can't find user account: $userId")

        val userPublicKey = subFlow(RequestKeyForAccount(userAccountInfo.state.data))
                .owningKey

        return Pair(userAccountInfo, userPublicKey)
    }

    private fun generateInputs(): StateAndRef<AttestationInfoState>? {
        val attestation = documentService.getAttestation(documentId.id)
        attestation?.state?.data?.attestations?.find {
            Pair(it.userId, it.version) == Pair(userId, version)
        } ?: return attestation
        throw FlowException("Attestation already exists")
    }

    private fun generateOutputs(input: AttestationInfoState? = null, userPublicKey: PublicKey, participants: List<PublicKey>):
            AttestationInfoState {
        input ?: return AttestationInfoState(documentId.id, listOf(Attestation(userId,
                version, Date())), participants)
        return input.copy(attestations = input.attestations.plus(Attestation(userId,
                version, Date())),
                parties
                = input.parties.plus(userPublicKey))
    }

    private fun transaction(input: StateAndRef<AttestationInfoState>? = null, output:
    AttestationInfoState, signers: List<PublicKey>): TransactionBuilder {
        val transaction = TransactionBuilder(serviceHub.networkMapCache.notaryIdentities.first())
        if (input != null) {
            transaction.addInputState(input)
        }
        return transaction.addOutputState(output, AttestationInfoContract.ID)
                .addCommand(AttestationInfoContract.Commands.Create(), signers)
    }

    private fun verifyAndSign(transaction: TransactionBuilder, signers: List<PublicKey>):
            SignedTransaction {
        transaction.verify(serviceHub)
        return serviceHub.signInitialTransaction(transaction, signers)
    }

    @Suspendable
    private fun createSessions(participants: List<AnonymousParty>): MutableList<FlowSession> {
        val sessions: MutableList<FlowSession> = mutableListOf()
        participants.forEach {
            val participantHost: Party = accountService.accountInfo(it.owningKey)!!.state.data.host
            if (participantHost != ourIdentity) {
                val accountSession: FlowSession = initiateFlow(participantHost)
                if (accountSession !in sessions)
                    sessions.add(accountSession)
            }
        }
        return sessions
    }

    @Suspendable
    private fun finaliseTransaction(signedTransaction: SignedTransaction, participants: List<AnonymousParty>) {
        val sessions = createSessions(participants)
        subFlow(FinalityFlow(signedTransaction, sessions))
    }

}

@InitiatedBy(AttestDocumentFlow::class)
class AttestDocumentFlowResponder(private val otherPartySession: FlowSession) : FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        subFlow(ReceiveFinalityFlow(otherPartySession))
    }
}