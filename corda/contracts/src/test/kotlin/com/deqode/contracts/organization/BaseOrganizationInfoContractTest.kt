package com.deqode.contracts.organization

import com.deqode.contracts.BaseContractTest
import com.deqode.contracts.OrganizationInfoContract
import com.deqode.schemas.OrganizationStatus
import com.deqode.states.OrganizationInfoState
import net.corda.core.contracts.UniqueIdentifier

open class BaseOrganizationInfoContractTest: BaseContractTest() {


    val ORGANIZATION_CONTRACT_ID = OrganizationInfoContract.ID

    val create = OrganizationInfoContract.Commands.Create()
    val updateStatus = OrganizationInfoContract.Commands.UpdateStatus()
    val updateParticipants = OrganizationInfoContract.Commands.UpdateParticipants()

    fun getInputOrgState(): OrganizationInfoState {
        return OrganizationInfoState("deqode.com", "deqode", "software company",
                OrganizationStatus.INACTIVE, partyA.publicKey, UniqueIdentifier(), listOf())
    }

    fun getOutputOrgState(): OrganizationInfoState {
        return OrganizationInfoState("deqode.com", "deqode", "software company",
                OrganizationStatus.ACTIVE, partyA.publicKey, UniqueIdentifier(), listOf())
    }
}