package com.deqode.flows.user

import co.paralleluniverse.fibers.Suspendable
import com.deqode.contracts.PublicUserAccountInfoContract
import com.deqode.flows.general.ShareStatesFlow
import com.deqode.schemas.UserRole
import com.deqode.schemas.UserStatus
import com.deqode.service.organizationService
import com.deqode.service.userService
import com.deqode.states.PublicUserAccountInfoState
import com.r3.corda.lib.accounts.contracts.states.AccountInfo
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
import net.corda.core.utilities.getOrThrow
import java.security.PublicKey
import java.util.*

@StartableByRPC
class CreateUserAccountFlow(private val adminId: UUID,
                            private val email: String,
                            private val firstName: String,
                            private val lastName: String) :
        FlowLogic<SignedTransaction>() {
    companion object {
        object GENERATING_OUTPUTS : ProgressTracker.Step("Generating Required Outputs")
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction")
        object SIGNING_TRANSACTION : ProgressTracker.Step("Verifying and Signing " +
                "transaction")

        object FINALISING_TRANSACTION : ProgressTracker.Step("Obtaining notary signature and recording transaction.") {
            override fun childProgressTracker() = FinalityFlow.tracker()
        }

        object BROADCAST_ACCOUNTS : ProgressTracker.Step("Broadcasting user account")

        fun tracker() = ProgressTracker(
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

        //Validate email
        userService.isValidEmailAddress(email)
        userService.isEmailUnique(email)

        val organizationState = organizationService.getCurrentOrganization(ourIdentity)
                ?: throw FlowException("Organization not found in this Node")

        //Create user Account from account's library
        val userAccount = accountService.createAccount(email).getOrThrow()
        val userPubKey = subFlow(RequestKeyForAccount(userAccount.state.data))
                .owningKey

        //Get admin Account
        val adminAccount = accountService.accountInfo(id = adminId) ?: throw
        FlowException("admin not found: $adminId")

        // Get admin PubKey
        val adminPubKey = subFlow(RequestKeyForAccount(adminAccount.state.data))
                .owningKey

        //Generating Outputs
        progressTracker.currentStep = GENERATING_OUTPUTS
        val userOutput = generateOutputs(userAccount.state.data.identifier.id,
                adminPubKey, userPubKey, organizationState.state.data.identifier.id,
                organizationState.state.data.uniqueName)

        //Generating Transactions
        progressTracker.currentStep = GENERATING_TRANSACTION
        val transaction = transaction(userOutput, listOf(adminPubKey))

        //Verifying adn signing the Transactions
        progressTracker.currentStep = SIGNING_TRANSACTION
        val signedTransaction = verifyAndSign(transaction, listOf(adminPubKey))

        //Finalising The transaction
        progressTracker.currentStep = FINALISING_TRANSACTION
        finaliseTransaction(signedTransaction)

        //Broadcasting the account
        progressTracker.currentStep = BROADCAST_ACCOUNTS
        broadcastAccounts(userAccount)

        return signedTransaction;

    }

    private fun generateOutputs(userId: UUID, adminPubKey: PublicKey, userPubKey:
    PublicKey, orgId: UUID, orgName: String):
            PublicUserAccountInfoState {
        return PublicUserAccountInfoState(userId, orgId, orgName, email, firstName,
                lastName,
                UserStatus.ACTIVE, UserRole.USER, adminPubKey, listOf(adminPubKey, userPubKey), Date(), Date())
    }

    private fun transaction(outputState: PublicUserAccountInfoState, signers: List<PublicKey>):
            TransactionBuilder {
        return TransactionBuilder(serviceHub.networkMapCache.notaryIdentities.first())
                .addOutputState(outputState, PublicUserAccountInfoContract.ID)
                .addCommand(PublicUserAccountInfoContract.Commands.Create(), signers)
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

    @Suspendable
    private fun broadcastAccounts(accountInfoState: StateAndRef<AccountInfo>) {
        val everyone = serviceHub.networkMapCache.allNodes.flatMap { it.legalIdentities };
        val everyoneButMeAndNotary = everyone.filter { serviceHub.networkMapCache.isNotary(it).not() } - ourIdentity
        val userId = accountInfoState.state.data.identifier.id
        val userStateAndRef = userService.getActiveUserAccountByUserId(userId) ?: throw
        FlowException("User not found : $userId")
        subFlow(ShareStatesFlow(everyoneButMeAndNotary, listOf(accountInfoState,
                userStateAndRef)))
    }
}
