package com.deqode.flows.general

import com.deqode.service.organizationService
import com.deqode.service.userService
import com.deqode.states.PublicUserAccountInfoState
import net.corda.core.flows.FlowException
import net.corda.core.flows.FlowLogic
import net.corda.core.flows.StartableByRPC
import java.util.*

@StartableByRPC
class GetUserDetailsFlow(private val userId: UUID) : FlowLogic<PublicUserAccountInfoState>
() {
    override fun call(): PublicUserAccountInfoState {
        val userInfo = userService.getActiveUserAccountByUserId(userId) ?: throw
        FlowException("User not found: $userId")

        val currentOrganization = organizationService.getCurrentOrganization(ourIdentity)
                ?: throw FlowException("Organization not found")

        if (userInfo.state.data.organizationId != currentOrganization.state.data
                        .identifier.id) {
            throw FlowException("User does not belongs to the current organization")
        }

        return userInfo.state.data
    }
}