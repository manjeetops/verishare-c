package com.deqode.flows.document

import co.paralleluniverse.fibers.Suspendable
import com.deqode.contracts.DocumentContract
import com.deqode.schemas.UserRole
import com.deqode.service.documentService
import com.deqode.service.userService
import com.deqode.states.DocumentInfoState
import com.deqode.states.PublicUserAccountInfoState
import com.r3.corda.lib.accounts.workflows.accountService
import com.r3.corda.lib.accounts.workflows.flows.RequestKeyForAccount
import net.corda.core.contracts.Command
import net.corda.core.contracts.StateAndRef
import net.corda.core.contracts.UniqueIdentifier
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
class DeleteDocumentFlow(
        private val documentId: UniqueIdentifier,
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
        val inputDocumentState: StateAndRef<DocumentInfoState> = getInput(documentId)

        //Check constraints
        checkConstraints(inputDocumentState.state.data)

        // Get initiator information
        val userPublicKey = getUserPubKey(userId)

        // Build transaction
        progressTracker.currentStep = BUILDING
        val outputDocumentState = getOutputs(inputDocumentState.state.data, listOf(userPublicKey))

        //Generate Transaction
        val transaction = transaction(inputDocumentState, outputDocumentState, listOf(userPublicKey))

        // Verify and sign the transaction
        progressTracker.currentStep = SIGNING
        val signedTransaction = verifyAndSign(transaction, listOf(userPublicKey))

        //Notarise and record the transaction in participants vault
        progressTracker.currentStep = FINALISING
        finaliseTransaction(signedTransaction, inputDocumentState.state.data.participantsList)

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
        return inputState.copy(
                deletedAt = Date(),
                updatedAt = Date(),
                signers = signers
        )
    }

    private fun transaction(inputState: StateAndRef<DocumentInfoState>, outputState:
    DocumentInfoState, signers: List<PublicKey>):
            TransactionBuilder {
        val notary = serviceHub.networkMapCache.notaryIdentities.first()
        val command = Command(DocumentContract.Commands.Delete(), signers)
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


    private fun checkConstraints(documentState: DocumentInfoState) {

        val user: PublicUserAccountInfoState = userService.getActiveUserAccountByUserId(userId)?.state?.data
                ?: throw FlowException("User account not found: $userId")

        // Frozen status check
        if (documentState.frozen && user.role != UserRole.ADMIN) {
            throw FlowException("Document $documentId is frozen")
        }

        // check for access, should be owner/admin
        if (userId != documentState.ownerId && user.role != UserRole.ADMIN) {
            throw IllegalStateException("No access for $documentId to be deleted")
        }
    }
}

@InitiatedBy(DeleteDocumentFlow::class)
class DeleteDocumentFlowResponder(private val otherPartySession: FlowSession) :
        FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        subFlow(ReceiveFinalityFlow(otherPartySession, statesToRecord = StatesToRecord.ALL_VISIBLE))
    }
}