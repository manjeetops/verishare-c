package com.deqode.flows.document

import co.paralleluniverse.fibers.Suspendable
import com.deqode.contracts.DocumentContract
import com.deqode.schemas.UserRole
import com.deqode.service.userService
import com.deqode.states.DocumentInfoState
import com.deqode.states.DocumentOwnershipHistory
import com.deqode.states.DocumentVersions
import com.deqode.states.PublicUserAccountInfoState
import com.r3.corda.lib.accounts.workflows.accountService
import com.r3.corda.lib.accounts.workflows.flows.RequestKeyForAccount
import net.corda.core.contracts.Command
import net.corda.core.crypto.SecureHash
import net.corda.core.flows.*
import net.corda.core.identity.AnonymousParty
import net.corda.core.transactions.SignedTransaction
import net.corda.core.transactions.TransactionBuilder
import net.corda.core.utilities.ProgressTracker
import net.corda.core.utilities.ProgressTracker.Step
import java.security.PublicKey
import java.util.*

@InitiatingFlow
@StartableByRPC
class UploadDocumentFlow(
        private val ownerId: UUID,
        private val name: String,
        private val description: String,
        private val frozen: Boolean,
        private val url: String,
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

        //check constraints
        val userDetails = checkConstraints(ownerId, userId, frozen)

        progressTracker.currentStep = BUILDING

        //Lookup the account and Public Key from the user id
        val userPubKey = getUserPubKey(userId)

        val participants = mutableListOf(userPubKey).map { AnonymousParty(it) }
        val signers = mutableListOf(userPubKey)

        //Creating the output
        val documentState = generateOutputs(userDetails.organizationId, signers, participants)

        //Create transaction
        val transaction = transaction(documentState, signers)

        progressTracker.currentStep = SIGNING
        //Verify and sign the transaction
        val signedTransaction = verifyAndSign(transaction, listOf(userPubKey))

        //Notarise and record the transaction in our vault
        progressTracker.currentStep = FINALISING
        finaliseTransaction(signedTransaction)

        return signedTransaction
    }

    private fun getUserPubKey(userId: UUID): PublicKey {
        val userAccountInfo = accountService.accountInfo(userId)
                ?: throw IllegalStateException("Can't find user account: $userId")

        return subFlow(RequestKeyForAccount(userAccountInfo.state.data))
                .owningKey
    }

    private fun generateOutputs(ownerOrgId: UUID, signers: List<PublicKey>,
                                participants: List<AnonymousParty>):
            DocumentInfoState {

        val ownershipHistory = setOf(DocumentOwnershipHistory(ownerId, Date()))
        val versions = listOf(DocumentVersions(1, type = type, sha256 = sha256, size =
        size))

        return DocumentInfoState(
                ownerId = ownerId,
                ownerOrgId = ownerOrgId,
                editorId = userId,
                name = name,
                description = description,
                frozen = frozen,
                url = url,
                version = 1,
                createdAt = Date(),
                updatedAt = Date(),
                ownershipHistory = ownershipHistory,
                permissions = null,
                versions = versions,
                signers = signers,
                participantsList = participants
        )
    }

    private fun transaction(outputState: DocumentInfoState, signers: List<PublicKey>):
            TransactionBuilder {
        val command = Command(DocumentContract.Commands.Upload(), signers)
        val notary = serviceHub.networkMapCache.notaryIdentities.first()

        //Build the transaction.
        return TransactionBuilder(notary)
                .addOutputState(outputState, DocumentContract.DOCUMENT_CONTRACT_ID)
                .addCommand(command)
    }

    private fun verifyAndSign(transaction: TransactionBuilder, signers: List<PublicKey>):
            SignedTransaction {
        transaction.verify(serviceHub)
        return serviceHub.signInitialTransaction(transaction, signers)
    }

    @Suspendable
    private fun finaliseTransaction(signedTransaction: SignedTransaction) {
        subFlow(FinalityFlow(signedTransaction, listOf()))
    }

    private fun checkConstraints(ownerId: UUID, userId: UUID, frozen: Boolean): PublicUserAccountInfoState {

        return if (ownerId == userId) {
            val userAccountInfoState = userService.getActiveUserAccountByUserId(userId)?.state?.data
                    ?: throw FlowException("User account not found: $userId")
            if (frozen && userAccountInfoState.role != UserRole.ADMIN) throw FlowException("Only admin can freeze a document")

            userAccountInfoState
        } else {
            val adminAccountInfoState = userService.getActiveUserAccountByUserId(userId)?.state?.data
                    ?: throw FlowException("Admin account not found: $userId")

            userService.getActiveUserAccountByUserId(ownerId)
                    ?: throw FlowException("Owner account not found: $ownerId")

            if (adminAccountInfoState.role != UserRole.ADMIN) throw FlowException("Only owner or admin can upload a document")

            adminAccountInfoState
        }
    }
}
