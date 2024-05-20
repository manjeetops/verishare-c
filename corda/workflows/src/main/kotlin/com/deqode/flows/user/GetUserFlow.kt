package com.deqode.flows.user


import com.deqode.service.userService
import com.deqode.states.PublicUserAccountInfoState
import net.corda.core.flows.FlowException
import net.corda.core.flows.FlowLogic
import net.corda.core.flows.StartableByRPC
import java.util.*

@StartableByRPC
class GetUserFlow(private val userId: UUID) :
        FlowLogic<PublicUserAccountInfoState>() {
    override fun call(): PublicUserAccountInfoState {
        val userInfo = userService.getActiveUserAccountByUserId(userId) ?: throw
        FlowException("User not found: $userId")

        return userInfo.state.data
    }
}