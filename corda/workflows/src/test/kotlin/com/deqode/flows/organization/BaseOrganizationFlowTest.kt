package com.deqode.flows.organization

import com.deqode.BaseFlowTest
import com.deqode.schemas.OrganizationStatus
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.identity.CordaX500Name
import net.corda.core.transactions.SignedTransaction
import net.corda.core.utilities.getOrThrow
import net.corda.testing.node.MockNetwork
import org.junit.After
import org.junit.Before

open class BaseOrganizationFlowTest : BaseFlowTest() {

    val orgId = UniqueIdentifier()
    val orgUniqueName = "deqode"
    val businessName = "deqode"
    val description = "software company"
    val adminEmail = "deqode@org.com"
    val adminFirstName = "deqode first name"
    val adminLastName = "deqode last name"

    @Before
    fun setUp() {
        network = MockNetwork(cordappPackages = listOf("com.deqode", "com.r3.corda.lib.accounts"))

        partyA = network.createPartyNode(CordaX500Name("PartyA", "London", "GB"))
        partyB = network.createPartyNode(CordaX500Name("PartyB", "New York", "US"))
        partyC = network.createPartyNode(CordaX500Name("PartyC", "London", "GB"))

        listOf(partyA, partyB, partyC).forEach {
            it.registerInitiatedFlow(CreateOrganizationFlow::class.java, CreateOrganizationFlowResponder::class.java)
            it.registerInitiatedFlow(CreateOrganizationFlowResponder::class.java,
                    CreateOrganizationFlowResponderTwo::class.java)
            it.registerInitiatedFlow(UpdateOrganizationFlow::class.java, UpdateOrganizationFlowResponder::class.java)
        }

        network.runNetwork()
    }

    @After
    fun tearDown() {
        network.stopNodes()
    }

    private fun createOrganizationFlow(orgId: UniqueIdentifier, orgUniqueName: String, businessName: String,
                                       description: String, adminEmail: String, adminFirstName: String, adminLastName: String): CreateOrganizationFlow {
        return CreateOrganizationFlow(orgId, orgUniqueName, businessName, description, adminEmail, adminFirstName, adminLastName)
    }

    private fun updateOrganizationFlow(orgStatus: OrganizationStatus) : UpdateOrganizationFlow {
        return UpdateOrganizationFlow(orgStatus)
    }

    fun createOrganization(orgId: UniqueIdentifier, orgUniqueName: String, businessName: String,
                           description: String, adminEmail: String, adminFirstName: String, adminLastName: String): SignedTransaction {
        val future = partyA.startFlow(createOrganizationFlow(orgId, orgUniqueName, businessName, description, adminEmail,
                adminFirstName, adminLastName))
        network.runNetwork()

        return future.getOrThrow()
    }

    fun updateOrganization(orgStatus: OrganizationStatus): SignedTransaction {
        val future = partyA.startFlow(updateOrganizationFlow(orgStatus))
        network.runNetwork()

        return future.getOrThrow()
    }
}