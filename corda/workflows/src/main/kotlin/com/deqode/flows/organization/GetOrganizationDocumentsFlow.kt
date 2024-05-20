package com.deqode.flows.organization

import co.paralleluniverse.fibers.Suspendable
import com.deqode.schemas.UserRole
import com.deqode.service.documentService
import com.deqode.service.userService
import com.deqode.states.Documents
import net.corda.core.flows.FlowException
import net.corda.core.flows.FlowLogic
import net.corda.core.flows.InitiatingFlow
import net.corda.core.flows.StartableByRPC
import java.util.*

@InitiatingFlow
@StartableByRPC
class GetOrganizationDocumentsFlow(
        private val userId: UUID,
        private val pageNo: Int = 1,
        private val pageSize: Int = 10
) : FlowLogic<Documents>() {
    @Suspendable
    override fun call(): Documents {

        // get user account state by user id
        val userDetails = userService.getActiveUserAccountByUserId(userId)?.state?.data
                ?: throw FlowException("User not found: $userId")

        // check user should be admin
        if (userDetails.role != UserRole.ADMIN)
            throw FlowException("Only admin can access all documents specific to org")

        val documentsList = documentService.getOrganizationDocuments(userDetails
                .organizationId, pageNo, pageSize)

        return Documents(documentsList.totalStatesAvailable, documentsList.states.map { it.state.data })
    }
}
