package com.deqode.flows.organization

import co.paralleluniverse.fibers.Suspendable
import com.deqode.contracts.OrganizationInfoContract
import com.deqode.contracts.PublicUserAccountInfoContract
import com.deqode.flows.general.ShareStatesFlow
import com.deqode.schemas.OrganizationStatus
import com.deqode.schemas.UserRole
import com.deqode.schemas.UserStatus
import com.deqode.service.organizationService
import com.deqode.service.userService
import com.deqode.states.OrganizationInfo
import com.deqode.states.OrganizationInfoState
import com.deqode.states.PublicUserAccountInfoState
import com.r3.corda.lib.accounts.contracts.states.AccountInfo
import com.r3.corda.lib.accounts.workflows.accountService
import com.r3.corda.lib.accounts.workflows.flows.RequestKeyForAccount
import net.corda.core.contracts.StateAndRef
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.flows.*
import net.corda.core.identity.AnonymousParty
import net.corda.core.transactions.SignedTransaction
import net.corda.core.transactions.TransactionBuilder
import net.corda.core.utilities.ProgressTracker
import net.corda.core.utilities.getOrThrow
import java.security.PublicKey
import java.util.*


@InitiatingFlow
@StartableByRPC
class CreateOrganizationFlow(private val orgId: UniqueIdentifier,
                             private val orgUniqueName: String,
                             private val businessName: String,
                             private val description: String,
                             private val adminEmail: String,
                             private val adminFirstName: String,
                             private val adminLastName: String) : FlowLogic<SignedTransaction>() {
    companion object {
        object GENERATING_OUTPUTS : ProgressTracker.Step("Generating Required Outputs")
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction")
        object SIGNING_TRANSACTION : ProgressTracker.Step("Verifying and Signing " +
                "transaction with Node private key.")

        object FINALISING_TRANSACTION : ProgressTracker.Step("Obtaining notary signature and recording transaction.") {
            override fun childProgressTracker() = FinalityFlow.tracker()
        }

        object BROADCAST_ACCOUNTS : ProgressTracker.Step("Broadcasting admin and " +
                "service accounts")

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
        //Check incoming data
        checkUniqueConstraints()

        val participants = organizationService.getEveryOneButNotaryAndMe(ourIdentity).map {
            AnonymousParty(it.owningKey)
        }.plus(AnonymousParty(ourIdentity.owningKey))

        progressTracker.currentStep = GENERATING_OUTPUTS
        //Creating admin and service accounts
        val adminAccountInfo = createUserAccountInfo(adminEmail)
        val serviceAccountEmail = "serviceAccount@${orgUniqueName.toLowerCase()}.com"
        val serviceAccountInfo = createUserAccountInfo(serviceAccountEmail)

        //Generating outputs
        val organizationInfo = generateOutputs(participants, adminAccountInfo,
                serviceAccountInfo)

        //Generating Transaction
        progressTracker.currentStep = GENERATING_TRANSACTION
        val transaction = transaction(organizationInfo.organizationInfoState,
                organizationInfo.adminAccountInfo, organizationInfo.serviceAccountInfo,
                adminAccountInfo.second)

        //Verifying and signing Transaction
        progressTracker.currentStep = SIGNING_TRANSACTION
        val signedTransaction = verifyAndSign(transaction, listOf(ourIdentity
                .owningKey, adminAccountInfo.second))


        //Finalising The transaction
        progressTracker.currentStep = FINALISING_TRANSACTION
        finaliseTransaction(signedTransaction)

        progressTracker.currentStep = BROADCAST_ACCOUNTS
        broadcastAccounts()

        return signedTransaction
    }

    private fun checkUniqueConstraints() {
        //Verify unique constraints
        organizationService.checkOrgConstraints(ourIdentity.owningKey, orgUniqueName)

        //Validate email
        userService.isValidEmailAddress(adminEmail)
        userService.isEmailUnique(adminEmail)
    }

    private fun createUserAccountInfo(email: String): Pair<StateAndRef<AccountInfo>, PublicKey> {
        val account = accountService.createAccount(email).getOrThrow()
        val publicKey = subFlow(RequestKeyForAccount(account.state.data))
                .owningKey
        return Pair(account, publicKey)
    }

    private fun generateOutputs(participants: List<AnonymousParty>, adminAccountInfo:
    Pair<StateAndRef<AccountInfo>, PublicKey>, serviceAccountInfo:
                                Pair<StateAndRef<AccountInfo>, PublicKey>): OrganizationInfo {
        //Create Organization Output
        val organizationOutput = OrganizationInfoState(orgUniqueName, businessName,
                description,
                OrganizationStatus.ACTIVE, ourIdentity.owningKey, orgId, participants)

        val adminAccountOutput = PublicUserAccountInfoState(adminAccountInfo.first.state
                .data.identifier.id, orgId.id, orgUniqueName, adminEmail, adminFirstName,
                adminLastName, UserStatus.ACTIVE, UserRole.ADMIN, adminAccountInfo.second,
                listOf(ourIdentity.owningKey, adminAccountInfo.second), Date(), Date())

        val serviceAccountOutput = PublicUserAccountInfoState(serviceAccountInfo.first.state
                .data.identifier.id, orgId.id, orgUniqueName, serviceAccountInfo.first
                .state.data.name, "serviceAccount",
                orgUniqueName, UserStatus.ACTIVE, UserRole.SERVICE, adminAccountInfo.second,
                listOf(ourIdentity.owningKey, serviceAccountInfo.second), Date(), Date())

        return OrganizationInfo(organizationInfoState = organizationOutput,
                adminAccountInfo = adminAccountOutput,
                serviceAccountInfo = serviceAccountOutput)

    }

    private fun transaction(organizationOutput: OrganizationInfoState,
                            adminAccountOutput: PublicUserAccountInfoState,
                            serviceAccountOutput: PublicUserAccountInfoState,
                            adminPublicKey: PublicKey):
            TransactionBuilder {
        return TransactionBuilder(serviceHub.networkMapCache.notaryIdentities.first())
                .addOutputState(organizationOutput, OrganizationInfoContract.ID)
                .addCommand(OrganizationInfoContract.Commands.Create(), listOf
                (ourIdentity.owningKey))
                .addOutputState(adminAccountOutput, PublicUserAccountInfoContract.ID)
                .addOutputState(serviceAccountOutput, PublicUserAccountInfoContract.ID)
                .addCommand(PublicUserAccountInfoContract.Commands.CreateOrgUsers(), listOf
                (adminPublicKey))
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

    @Suspendable
    private fun broadcastAccounts() {
        val everyone = serviceHub.networkMapCache.allNodes.flatMap { it.legalIdentities };
        val everyoneButMeAndNotary = everyone.filter { serviceHub.networkMapCache.isNotary(it).not() } - ourIdentity
        val organizationUsers = organizationService.getOrganizationUsers(ourIdentity).states
        val organizationAccountInfoList = organizationService.getOrganizationAccountInfoList()
        subFlow(ShareStatesFlow(everyoneButMeAndNotary, organizationUsers.plus(organizationAccountInfoList)))
    }
}


@InitiatingFlow
@InitiatedBy(CreateOrganizationFlow::class)
class CreateOrganizationFlowResponder(private val otherPartySession: FlowSession) : FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        subFlow(ReceiveFinalityFlow(otherPartySession))

        val organization = organizationService.getCurrentOrganization(ourIdentity)
                ?: return

        val participants = organizationService.getEveryOneButNotaryAndMe(ourIdentity).map {
            AnonymousParty(it.owningKey)
        }.plus(AnonymousParty(ourIdentity.owningKey))

        //Build the transaction
        val transactionBuilder = TransactionBuilder(serviceHub.networkMapCache.notaryIdentities.first())
                .addInputState(organization)
                .addOutputState(organization.state.data.copy(parties = participants),
                        OrganizationInfoContract.ID)
                .addCommand(OrganizationInfoContract.Commands.UpdateParticipants(), listOf
                (ourIdentity.owningKey))

        //Verify the transaction
        transactionBuilder.verify(serviceHub)

        //Sign the transaction
        val signedTransaction = serviceHub.signInitialTransaction(transactionBuilder, listOfNotNull(ourIdentity.owningKey))

        //Finalising the transaction
        val sessions = organizationService.getEveryOneButNotaryAndMe(ourIdentity).map { otherParty ->
            initiateFlow(otherParty)
        }
        subFlow(FinalityFlow(signedTransaction, sessions))

        //Broadcast accounts
        val organizationUsers = organizationService.getOrganizationUsers(ourIdentity).states
        val organizationAccountInfoList = organizationService.getOrganizationAccountInfoList()
        subFlow(ShareStatesFlow(listOf(otherPartySession.counterparty),
                organizationUsers.plus(organizationAccountInfoList)))
    }
}

@InitiatedBy(CreateOrganizationFlowResponder::class)
class CreateOrganizationFlowResponderTwo(private val otherPartySession: FlowSession) : FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        subFlow(ReceiveFinalityFlow(otherPartySession))
    }
}


