package com.deqode.flows.user

import com.deqode.states.PublicUserAccountInfoState
import com.deqode.states.SerializedPublicUserAccountInfoState
import net.corda.core.flows.FlowLogic
import net.corda.core.flows.StartableByRPC
import net.corda.core.node.services.queryBy
import net.corda.core.node.services.vault.PageSpecification
import net.corda.core.serialization.CordaSerializable

@StartableByRPC
class GetAllUsersFlow(private val pageNumber: Int = 1, private val pageSize: Int = 10) :
        FlowLogic<AllUsers>() {
    override fun call(): AllUsers {
        val userStates = serviceHub.vaultService
                .queryBy<PublicUserAccountInfoState>(PageSpecification(pageNumber, pageSize))
        val totalNoOfUsers = userStates.totalStatesAvailable
        val users = userStates.states.map { it.state.data }
        return AllUsers(totalNoOfUsers, users)
    }

}

@CordaSerializable
data class AllUsers(val totalNoOfUsers: Long, val users: List<PublicUserAccountInfoState>)

@CordaSerializable
data class SerializedUsers(private val totalNoOfUsers: Long, private val users: List<SerializedPublicUserAccountInfoState>)