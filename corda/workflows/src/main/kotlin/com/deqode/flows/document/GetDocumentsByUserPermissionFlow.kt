package com.deqode.flows.document

import co.paralleluniverse.fibers.Suspendable
import com.deqode.service.documentService
import com.deqode.service.organizationService
import com.deqode.service.userService
import com.deqode.states.Documents
import net.corda.core.flows.FlowException
import net.corda.core.flows.FlowLogic
import net.corda.core.flows.InitiatingFlow
import net.corda.core.flows.StartableByRPC
import java.util.*

@InitiatingFlow
@StartableByRPC
class GetDocumentsByUserPermissionFlow(
        private val userId: UUID,
        private val pageNo: Int = 1,
        private val pageSize: Int = 10
) : FlowLogic<Documents>() {

    @Suspendable
    override fun call(): Documents {

        // get user state for requester user
        val userDetails = userService.getActiveUserAccountByUserId(userId)?.state?.data
                ?: throw FlowException("User not found: $userId")

        // return documents only those contain requester user in permission list
        val serviceAccount = organizationService.getOrgServiceAccount(
                userDetails.organizationId).state.data
        return documentService.getDocumentsByUserPermission(userId, serviceAccount.id, pageNo, pageSize)
    }
}
