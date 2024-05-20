package com.deqode.flows.document

import co.paralleluniverse.fibers.Suspendable
import com.deqode.contracts.DocumentContract
import com.deqode.schemas.UserRole
import com.deqode.service.documentService
import com.deqode.service.userService
import com.deqode.states.DocumentInfoState
import com.deqode.states.DocumentVersions
import com.r3.corda.lib.accounts.workflows.accountService
import com.r3.corda.lib.accounts.workflows.flows.RequestKeyForAccount
import net.corda.core.contracts.Command
import net.corda.core.contracts.StateAndRef
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.crypto.SecureHash
import net.corda.core.flows.*
import net.corda.core.identity.AbstractParty
import net.corda.core.identity.Party
import net.corda.core.node.StatesToRecord
import net.corda.core.transactions.SignedTransaction
import net.corda.core.transactions.TransactionBuilder
import net.corda.core.utilities.ProgressTracker
import net.corda.core.utilities.ProgressTracker.Step
import java.security.PublicKey
import java.util.*

@InitiatingFlow
@StartableByRPC
class UpdateDocumentVersionFlow(
        private val documentId: UniqueIdentifier,
        private val type: String,
        private val sha256: SecureHash,
        private val size: Int,
        private val userId: UUID
) : FlowLogic<SignedTransaction>() {

    companion object {
        object BUILDING : Step("Building a new transaction.")
        object SIGNING : Step("Signing the transaction with our private key.")
        object COLLECTING : Step("Collecting the counterparty's signature.") {
            override fun childProgressTracker() = CollectSignaturesFlow.tracker()
        }

        object FINALISING : Step("Obtaining notary signature and recording transaction.") {
            override fun childProgressTracker() = FinalityFlow.tracker()
        }

        fun tracker() = ProgressTracker(
                BUILDING,
                SIGNING,
                COLLECTING,
                FINALISING
        )
    }

    override val progressTracker = tracker()

    @Suspendable
    override fun call(): SignedTransaction {

        // Fetch document by id
        val inputDocumentState = getInput(documentId)

        // check for access, should have permission to edit and check for constraints
        checkConstraint(inputDocumentState.state.data)

        // Get initiator information
        val userPubKey = getUserPubKey(userId)

        // Build transaction
        progressTracker.currentStep = BUILDING
        val outputDocumentState = getOutputs(inputDocumentState.state.data, listOf(userPubKey))

        val transaction = transaction(inputDocumentState, outputDocumentState, listOf(userPubKey))

        //Locally sign the txn as initiator
        progressTracker.currentStep = SIGNING
        val signedTransaction = verifyAndSign(transaction, listOf(userPubKey))

        //Notarise and record the transaction in participants vault
        progressTracker.currentStep = FINALISING
        finaliseTransaction(signedTransaction, inputDocumentState.state.data.participantsList)

        // Finalize transaction
        return signedTransaction
    }

    private fun getInput(documentId: UniqueIdentifier): StateAndRef<DocumentInfoState> {
        return documentService.getDocument(documentId)
    }

    private fun getUserPubKey(userId: UUID): PublicKey {
        val userAccountInfo = accountService.accountInfo(userId)
                ?: throw IllegalStateException("Can't find user account: $userId")

        return subFlow(RequestKeyForAccount(userAccountInfo.state.data))
                .owningKey
    }

    private fun getOutputs(inputState: DocumentInfoState, signers: List<PublicKey>)
            : DocumentInfoState {
        val version = DocumentVersions(inputState.version + 1, type = type, sha256 = sha256, size = size)
        return inputState.copy(
                version = inputState.version + 1,
                updatedAt = Date(),
                versions = inputState.versions.plus(version),
                signers = signers,
                editorId = userId
        )
    }

    private fun transaction(inputState: StateAndRef<DocumentInfoState>, outputState:
    DocumentInfoState, signers: List<PublicKey>):
            TransactionBuilder {
        val notary = serviceHub.networkMapCache.notaryIdentities.first()
        val command = Command(DocumentContract.Commands.UpdateVersion(), signers)
        return TransactionBuilder(notary)
                .addInputState(inputState)
                .addOutputState(outputState, DocumentContract.DOCUMENT_CONTRACT_ID)
                .addCommand(command)
    }

    private fun verifyAndSign(transaction: TransactionBuilder, signers: List<PublicKey>):
            SignedTransaction {
        transaction.verify(serviceHub)
        return serviceHub.signInitialTransaction(transaction, signers)
    }

    private fun createSessions(participants:
                               List<AbstractParty>): MutableList<FlowSession> {
        val sessionsForAccountsToSendTo: MutableList<FlowSession> = mutableListOf()
        participants.forEach {
            val participantHost: Party = accountService.accountInfo(it.owningKey)!!.state.data.host
            if (participantHost != ourIdentity) {
                val accountSession: FlowSession = initiateFlow(participantHost)
                if (accountSession !in sessionsForAccountsToSendTo)
                    sessionsForAccountsToSendTo.add(accountSession)
            }
        }
        return sessionsForAccountsToSendTo
    }

    @Suspendable
    private fun finaliseTransaction(signedTransaction: SignedTransaction, participants:
    List<AbstractParty>) {
        val sessions = createSessions(participants)
        subFlow(FinalityFlow(signedTransaction, sessions))
    }

    private fun checkConstraint(documentState: DocumentInfoState) {
        // Get User Account Info
        val user = userService.getActiveUserAccountByUserId(userId)?.state?.data
                ?: throw FlowException("User not found: $userId")

        // check for access and possibility of document edit
        documentService.hasEditDocumentAccess(documentState, user)

        // Frozen status check
        if (documentState.frozen && user.role != UserRole.ADMIN) {
            throw FlowException("Document $documentId is frozen")
        }

        // check same file is not uploaded
        val versionDetails = documentState.versions.first { it.version == documentState.version }
        if(versionDetails.sha256 == sha256) throw FlowException("Same files " +
                "already " +
                "present for document $documentId")
    }

}

@InitiatedBy(UpdateDocumentVersionFlow::class)
class UpdateDocumentVersionFlowResponder(private val otherPartySession: FlowSession) :
        FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        subFlow(ReceiveFinalityFlow(otherPartySession, statesToRecord = StatesToRecord.ALL_VISIBLE))
    }
}