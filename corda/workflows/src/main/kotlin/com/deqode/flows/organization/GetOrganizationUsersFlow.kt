package com.deqode.flows.organization

import com.deqode.service.organizationService
import com.deqode.states.PublicUserAccountInfoState
import com.deqode.states.SerializedPublicUserAccountInfoState
import net.corda.core.flows.FlowLogic
import net.corda.core.flows.StartableByRPC
import net.corda.core.serialization.CordaSerializable
import java.util.*

@StartableByRPC
class GetOrganizationUsersFlow(private val organizationId: UUID,
                               private val pageNumber: Int = 1,
                               private val pageSize: Int = 10) :
        FlowLogic<OrganizationUsers>() {
    override fun call(): OrganizationUsers {
        val organizationUsers = organizationService.getOrganizationUsers(organizationId, pageNumber, pageSize)
        val totalNoOfUsers = organizationUsers.totalStatesAvailable
        return OrganizationUsers(totalNoOfUsers, organizationUsers.states.map { it.state.data })
    }

}

@CordaSerializable
data class OrganizationUsers(val totalNoOfUsers: Long, val users: List<PublicUserAccountInfoState>)

@CordaSerializable
data class SerializedOrganizationUsers(private val totalNoOfUsers: Long, private val users: List<SerializedPublicUserAccountInfoState>)