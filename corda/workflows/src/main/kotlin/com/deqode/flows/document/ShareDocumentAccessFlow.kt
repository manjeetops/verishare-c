package com.deqode.flows.document

import co.paralleluniverse.fibers.Suspendable
import com.deqode.contracts.DocumentContract
import com.deqode.schemas.UserRole
import com.deqode.service.documentService
import com.deqode.service.organizationService
import com.deqode.service.userService
import com.deqode.states.DocumentAccessScope
import com.deqode.states.DocumentInfoState
import com.deqode.states.DocumentPermissions
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
class ShareDocumentAccessFlow(
        private val documentId: UniqueIdentifier,
        private val receiverId: UUID,
        private val accessType: DocumentPermissions,
        private val accessScope: DocumentAccessScope,
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

        //Get UserP Public Key
        val userPubKey = getUserPubKey(userId)

        // Fetch document by id
        val inputDocumentState: StateAndRef<DocumentInfoState> = documentService
                .getDocument(documentId)

        //Check constraints
        checkConstraint(inputDocumentState)

        val receiverPubKeyAndHost = getReceiverPubKeyAndHost()

        // TODO: if scope is network, need to decide

        progressTracker.currentStep = BUILDING
        val signers = mutableListOf(userPubKey, receiverPubKeyAndHost.first)

        //Get Outputs
        val outputState = generateOutputs(inputDocumentState.state.data, signers,
                receiverPubKeyAndHost.first)

        //Generate Transaction
        val transaction = transaction(inputDocumentState, outputState, signers)

        progressTracker.currentStep = SIGNING
        //Verify and sign the transaction
        val locallySignedTx = verifyAndSign(transaction, listOf(ourIdentity.owningKey,
                userPubKey))

        val toUserAccountSession = initiateFlow(receiverPubKeyAndHost.second)

        //Get counterParty signature
        val signedTransaction = getCounterPartySignature(locallySignedTx, toUserAccountSession)

        progressTracker.currentStep = FINALISING
        //Finalise the transaction
        finaliseTransaction(signedTransaction, inputDocumentState.state.data
                .participantsList, receiverPubKeyAndHost.second, toUserAccountSession)

        return signedTransaction
    }

    private fun getUserPubKey(userId: UUID): PublicKey {
        val userAccountInfo = accountService.accountInfo(userId)
                ?: throw IllegalStateException("Can't find user account: $userId")

        return subFlow(RequestKeyForAccount(userAccountInfo.state.data))
                .owningKey
    }

    @Suspendable
    private fun getReceiverPubKeyAndHost(): Pair<PublicKey, Party> {
        val receiverPubKey: PublicKey
        val host: Party

        if (accessScope == DocumentAccessScope.USER) {
            val userAccountInfo = accountService.accountInfo(receiverId)
                    ?: throw IllegalStateException("Can't find requester user account: $receiverId")

            receiverPubKey = subFlow(RequestKeyForAccount(userAccountInfo.state.data))
                    .owningKey
            host = userAccountInfo.state.data.host

            userService.getActiveUserAccountByUserId(receiverId)?.state?.data
                    ?: throw FlowException("requester user not found: $receiverId")
        } else {
            val organizationInfoStateAndRef = organizationService.getOrganization(receiverId)
            val orgServiceAccount = organizationService.getOrgServiceAccount(organizationInfoStateAndRef.state.data.identifier.id)
            val serviceAccountInfo = accountService.accountInfo(orgServiceAccount.state
                    .data.id) ?: throw IllegalStateException("Can't find service account")

            receiverPubKey = subFlow(RequestKeyForAccount(serviceAccountInfo.state.data)).owningKey

            val adminAccountInfoStateAndRef = organizationService.getOrganizationAdmin(receiverId)

            val adminId = adminAccountInfoStateAndRef.state.data.id
            val adminAccountInfo = accountService.accountInfo(adminId)
                    ?: throw IllegalStateException("Can't find admin account: $adminId")
            host = adminAccountInfo.state.data.host
        }

        return Pair(receiverPubKey, host)
    }

    private fun generateOutputs(inputDocumentState: DocumentInfoState, signers:
    List<PublicKey>, receiverPubKey: PublicKey)
            : DocumentInfoState {
        val outputDocumentState = inputDocumentState.grantAccess(receiverId, accessScope, accessType)
        return outputDocumentState.copy(
                updatedAt = Date(),
                participantsList = outputDocumentState.participantsList.plus(AnonymousParty(receiverPubKey)),
                signers = signers
        )
    }

    private fun transaction(inputState: StateAndRef<DocumentInfoState>, outputState:
    DocumentInfoState, signers: List<PublicKey>): TransactionBuilder {
        val notary = serviceHub.networkMapCache.notaryIdentities.first()
        val command = Command(DocumentContract.Commands.ShareAccess(), signers)
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

    private fun checkConstraint(documentState: StateAndRef<DocumentInfoState>) {

        val userAccount = userService.getActiveUserAccountByUserId(userId)?.state?.data
                ?: throw FlowException("User not found: $userId")

        // check only owner or admin can grant share access permission
        if ((documentState.state.data.ownerId != userId) && (userAccount.role != UserRole.ADMIN))
            throw FlowException("Only owner or admin can grant share access to other user")

        // check requester user has already permission given
        documentState.state.data.permissions?.forEach {
            if (it.userId == receiverId && it.accessType == accessType && it.accessScope ==
                    accessScope)
                throw FlowException("Share permission access for user id: $userId is already given")
        }

    }
}


@InitiatedBy(ShareDocumentAccessFlow::class)
class ShareDocumentAccessFlowResponder(private val otherPartySession: FlowSession) :
        FlowLogic<Unit>() {
    @Suspendable
    override fun call() {

        val signTransactionFlow = object : SignTransactionFlow(otherPartySession) {
            override fun checkTransaction(stx: SignedTransaction) = requireThat {
            }
        }
        val txId = subFlow(signTransactionFlow).id
        subFlow(ReceiveFinalityFlow(otherPartySession, statesToRecord = StatesToRecord.ALL_VISIBLE, expectedTxId = txId))

    }
}