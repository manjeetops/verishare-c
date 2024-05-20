package com.deqode.flows.organization

import com.deqode.service.organizationService
import com.deqode.states.OrganizationInfoState
import com.deqode.states.SerializedOrganizationInfoState
import net.corda.core.flows.FlowLogic
import net.corda.core.flows.StartableByRPC
import net.corda.core.serialization.CordaSerializable

@StartableByRPC
class GetAllOrganizationsFlow(private val pageNumber: Int = 1,
                              private val pageSize: Int = 10) :
        FlowLogic<Organizations>() {
    override fun call(): Organizations {
        val orgStates = organizationService.getAllOrganizations(pageNumber, pageSize)
        val totalOrganizations = orgStates.totalStatesAvailable
        val organizations = orgStates.states.map { it -> it.state.data }

        return Organizations(totalOrganizations, organizations)
    }
}

@CordaSerializable
data class Organizations(val totalOrganizations: Long, val organizations: List<OrganizationInfoState>)

@CordaSerializable
data class SerializedOrganizations(private val totalOrganizations: Long, private val organizations: List<SerializedOrganizationInfoState>)