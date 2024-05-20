package com.deqode.flows.organization


import com.deqode.states.OrganizationInfoState
import org.junit.Test
import kotlin.test.assertEquals


class CreateOrganizationFlowTests : BaseOrganizationFlowTest() {

    @Test
    fun `flow accepts valid org state` () {
        createOrganization(orgId, orgUniqueName, businessName, description, adminEmail, adminFirstName, adminLastName)
    }

    @Test
    fun `signed tx returned by flow is signed by host` () {
        val signedTx = createOrganization(orgId, orgUniqueName, businessName, description, adminEmail, adminFirstName, adminLastName)
        signedTx.verifySignaturesExcept()
    }

    @Test
    fun `signed tx returned by flow is signed by host and notary` () {
        val signedTx = createOrganization(orgId, orgUniqueName, businessName, description, adminEmail, adminFirstName, adminLastName)
        signedTx.verifyRequiredSignatures()
    }

    @Test
    fun `flow record tx in organization's transaction storage` () {
        val signedTx = createOrganization(orgId, orgUniqueName, businessName, description, adminEmail, adminFirstName, adminLastName)
        assertEquals(signedTx, partyA.services.validatedTransactions.getTransaction(signedTx.id))
    }

    @Test
    fun `recorded tx has no input and one org output` () {
        val signedTx = createOrganization(orgId, orgUniqueName, businessName, description, adminEmail, adminFirstName, adminLastName)

        val recordedTx = partyA.services.validatedTransactions.getTransaction(signedTx.id)
        val txOutputs = recordedTx!!.tx.outputs
        assert(txOutputs.size == 3)

        val recordedState = txOutputs[0].data as OrganizationInfoState
        assertEquals(recordedState.identifier, orgId)
    }
}