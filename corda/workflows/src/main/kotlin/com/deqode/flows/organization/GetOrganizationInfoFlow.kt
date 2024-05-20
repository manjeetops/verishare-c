package com.deqode.flows.organization

import com.deqode.service.organizationService
import com.deqode.states.OrganizationInfoState
import net.corda.core.flows.FlowLogic
import net.corda.core.flows.StartableByRPC
import java.util.*

@StartableByRPC
class GetOrganizationInfoFlow(private val orgId: UUID) : FlowLogic<OrganizationInfoState>() {
    override fun call(): OrganizationInfoState {
        val organizationInfo = organizationService.getOrganization(orgId)
        return organizationInfo.state.data
    }
}