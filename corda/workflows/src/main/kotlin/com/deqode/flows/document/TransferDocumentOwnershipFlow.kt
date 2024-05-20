package com.deqode.flows.document

import co.paralleluniverse.fibers.Suspendable
import com.deqode.contracts.DocumentContract
import com.deqode.schemas.UserRole
import com.deqode.service.documentService
import com.deqode.service.userService
import com.deqode.states.DocumentInfoState
import com.deqode.states.DocumentOwnershipHistory
import com.r3.corda.lib.accounts.contracts.states.AccountInfo
import com.r3.corda.lib.accounts.workflows.accountService
import com.r3.corda.lib.accounts.workflows.flows.RequestKeyForAccount
import net.corda.core.contracts.Command
import net.corda.core.contracts.StateAndRef
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.contracts.requireThat
import net.corda.core.flows.*
import net.corda.core.identity.AbstractParty
import net.corda.core.identity.AnonymousParty
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
class TransferDocumentOwnershipFlow(
        private val documentId: UniqueIdentifier,
        private val newOwnerId: UUID,
        private val oldOwnerId: UUID
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
        //Get new owner details
        val newOwnerDetails = userService.getActiveUserAccountByUserId(oldOwnerId)?.state?.data
                ?: throw FlowException("present owner id is not correct: $oldOwnerId")

        // Get old owner info
        val ownerAccountInfo = getUserAccountInfo(oldOwnerId)

        // Get new owner info
        val newOwnerAccountInfo = getUserAccountInfo(newOwnerId)

        // Fetch document by id
        val inputDocumentState: StateAndRef<DocumentInfoState> = getInput(documentId)

        //Check constraints
        checkConstraint(inputDocumentState.state.data)

        progressTracker.currentStep = BUILDING
        val signers = mutableListOf(ownerAccountInfo.second, newOwnerAccountInfo.second)

        //Generate Outputs
        val outputDocumentState = getOutputs(inputDocumentState.state.data, signers,
                newOwnerAccountInfo.second, newOwnerDetails.organizationId)

        //Generate Transaction
        val transaction = transaction(inputDocumentState, outputDocumentState, signers)

        //Verify and sign the transaction
        progressTracker.currentStep = SIGNING
        val locallySignedTx = verifyAndSign(transaction, listOf(ourIdentity
                .owningKey, ownerAccountInfo
                .second))

        val toUserAccountSession = initiateFlow(newOwnerAccountInfo.first.state.data.host)

        // collect signature from counter party
        progressTracker.currentStep = COLLECTING
        val signedTx = getCounterPartySignature(locallySignedTx, toUserAccountSession)

        progressTracker.currentStep = FINALISING
        //Notarise and record the transaction in participants vault
        finaliseTransaction(signedTx, inputDocumentState.state.data.participantsList,
                newOwnerAccountInfo.first.state.data.host, toUserAccountSession)

        // share attestation to new owner related to doc
        broadcastAttestation()

        return signedTx
    }

    @Suspendable
    private fun getUserAccountInfo(userId: UUID): Pair<StateAndRef<AccountInfo>, PublicKey> {
        val userAccountInfo = accountService.accountInfo(userId)
                ?: throw IllegalStateException("Can't find user account: $userId")

        val publicKey = subFlow(RequestKeyForAccount(userAccountInfo.state.data))
                .owningKey

        return Pair(userAccountInfo, publicKey)
    }

    private fun getInput(documentId: UniqueIdentifier): StateAndRef<DocumentInfoState> {
        return documentService.getDocument(documentId)
    }

    private fun getOutputs(inputState: DocumentInfoState, signers: List<PublicKey>,
                           newOwnerPublicKey: PublicKey,
                           newOwnerOrgId: UUID)
            : DocumentInfoState {
        var owner: AbstractParty? = null
        inputState.participantsList.forEach {
            val userId = accountService.accountIdForKey(it.owningKey)
            if(userId == inputState.ownerId){
                owner = it
                return@forEach
            }
        }
        return inputState.copy(
                ownerId = newOwnerId,
                ownerOrgId = newOwnerOrgId,
                updatedAt = Date(),
                ownershipHistory = inputState.ownershipHistory?.plus(DocumentOwnershipHistory(newOwnerId, Date())),
                participantsList = inputState.participantsList.plus(AnonymousParty
                (newOwnerPublicKey)).minus(owner?: throw FlowException("Owner not found")),
                signers = signers
        )
    }

    private fun transaction(inputState: StateAndRef<DocumentInfoState>, outputState:
    DocumentInfoState, signers: List<PublicKey>):
            TransactionBuilder {
        val notary = serviceHub.networkMapCache.notaryIdentities.first()
        val command = Command(DocumentContract.Commands.TransferOwnership(), signers)
        val documentVersionSha = outputState.versions.first{it.version == outputState
                .version}.sha256 ?: throw FlowException("version not found")
        return TransactionBuilder(notary)
                .addInputState(inputState)
                .addOutputState(outputState, DocumentContract.DOCUMENT_CONTRACT_ID)
                .addCommand(command)
                .addAttachment(documentVersionSha)
    }

    private fun verifyAndSign(transaction: TransactionBuilder, signers: List<PublicKey>):
            SignedTransaction {
        transaction.verify(serviceHub)
        return serviceHub.signInitialTransaction(transaction, signers)
    }

    @Suspendable
    private fun getCounterPartySignature(locallySignedTx: SignedTransaction,
                                         hostSession: FlowSession): SignedTransaction {
        return subFlow(CollectSignaturesFlow(locallySignedTx, listOf(hostSession)))
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
    List<AbstractParty>, host: Party, hostSession: FlowSession) {
        val sessions = createSessions(participants)
        if (host != ourIdentity) {
            sessions.add(hostSession)
        }
        subFlow(FinalityFlow(signedTransaction, sessions))
    }

    private fun checkConstraint(documentState: DocumentInfoState) {
        //Get owner Details
        val ownerDetails = userService.getActiveUserAccountByUserId(oldOwnerId)?.state?.data
                ?: throw FlowException("present owner id is not correct: $oldOwnerId")

        // Frozen status check
        if (documentState.frozen && ownerDetails.role != UserRole.ADMIN) {
            throw IllegalStateException("Document $documentId is frozen")
        }

        // check for access,
        if (oldOwnerId != documentState.ownerId && ownerDetails.role != UserRole.ADMIN) {
            throw IllegalStateException("User $oldOwnerId does not have access to Document $documentId")
        }
    }

    private fun broadcastAttestation() {
        // If no attestation found then simply return
        val attestationInfoState = documentService.getAttestation(documentId.id) ?: return
        // if attestation exist for doc id then share with new owner
        accountService.shareStateWithAccount(newOwnerId, attestationInfoState)
    }
}


@InitiatedBy(TransferDocumentOwnershipFlow::class)
class TransferDocumentOwnershipFlowResponder(private val otherPartySession: FlowSession) :
        FlowLogic<Unit>() {
    @Suspendable
    override fun call() {

        val signTransactionFlow = object : SignTransactionFlow(otherPartySession) {
            override fun checkTransaction(stx: SignedTransaction) = requireThat {
            }
        }
        val txId = subFlow(signTransactionFlow).id
        subFlow(ReceiveFinalityFlow(otherPartySession, expectedTxId = txId,
                statesToRecord = StatesToRecord.ALL_VISIBLE))

    }
}