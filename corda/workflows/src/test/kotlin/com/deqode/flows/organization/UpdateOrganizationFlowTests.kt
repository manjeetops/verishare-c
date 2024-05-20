package com.deqode.flows.organization

import com.deqode.schemas.OrganizationStatus
import com.deqode.states.OrganizationInfoState
import net.corda.core.contracts.StateRef
import net.corda.core.contracts.TransactionVerificationException
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class UpdateOrganizationFlowTests : BaseOrganizationFlowTest() {

    @Test
    fun `flow accepts valid update org state` () {

        val stxCreateOrganizationFlow = createOrganization(orgId, orgUniqueName, businessName, description, adminEmail, adminFirstName, adminLastName)
        stxCreateOrganizationFlow.coreTransaction.outputStates[0] as OrganizationInfoState

        updateOrganization(OrganizationStatus.INACTIVE)
    }

    @Test
    fun `flow rejects if input and output state have same status`() {
        val stxCreateOrganizationFlow = createOrganization(orgId, orgUniqueName, businessName, description, adminEmail, adminFirstName, adminLastName)
        val inputOrgState = stxCreateOrganizationFlow.coreTransaction.outputStates[0] as OrganizationInfoState

        assertFailsWith<TransactionVerificationException> { updateOrganization(inputOrgState.status) }
    }

    @Test
    fun `signed tx returned by update org flow is signed by host` () {
        createOrganization(orgId, orgUniqueName, businessName, description, adminEmail, adminFirstName, adminLastName)

        val signedTx = updateOrganization(OrganizationStatus.INACTIVE)
        signedTx.verifySignaturesExcept(network.defaultNotaryNode.info.legalIdentitiesAndCerts.first().owningKey)
    }

    @Test
    fun `flow record tx in organization's transaction storage` () {
        createOrganization(orgId, orgUniqueName, businessName, description, adminEmail, adminFirstName, adminLastName)

        val signedTx = updateOrganization(OrganizationStatus.INACTIVE)
        assertEquals(signedTx.id, partyA.services.validatedTransactions.getTransaction(signedTx.id)?.id)
    }

    @Test
    fun `recorded tx has one input and one org output` () {
        val signedTxCreate = createOrganization(orgId, orgUniqueName, businessName, description, adminEmail, adminFirstName, adminLastName)

        val signedTxUpdate = updateOrganization(OrganizationStatus.INACTIVE)

        val recordedTx = partyA.services.validatedTransactions.getTransaction(signedTxUpdate.id)
        val txOutputs = recordedTx!!.tx.outputs
        val txInputs = recordedTx!!.tx.inputs

        assert(txInputs.size == 1)
        assert(txOutputs.size == 1)
        assert(txInputs[0] == StateRef(signedTxCreate.id, 0))

        val inputOrgState = txInputs[0]
        val outputOrgState = txOutputs[0].data as OrganizationInfoState

        assert(outputOrgState.status == OrganizationStatus.INACTIVE)
    }

}