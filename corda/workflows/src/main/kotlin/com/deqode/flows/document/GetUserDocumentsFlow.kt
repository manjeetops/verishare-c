package com.deqode.flows.document

import co.paralleluniverse.fibers.Suspendable
import com.deqode.schemas.UserRole
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
class GetUserDocumentsFlow(
        private val requesterUserId: UUID,
        private val targetUserId: UUID,
        private val pageNo: Int = 1,
        private val pageSize: Int = 10
) : FlowLogic<Documents>() {

    @Suspendable
    override fun call(): Documents {

        // get user state for requester user
        val requesterUserDetails = userService.getActiveUserAccountByUserId(requesterUserId)?.state?.data
                ?: throw FlowException("User not found: $requesterUserId")

        // get user state for target user
        val targetUserDetails = userService.getActiveUserAccountByUserId(targetUserId)?.state?.data
                ?: throw FlowException("Target user not found: $targetUserId")


        // check requester user and target user are same or not
        if (requesterUserId == targetUserId) {
            val documentsList = documentService.getDocumentsByUserId(targetUserId,
                    pageNo, pageSize)
            return Documents(documentsList.totalStatesAvailable, documentsList.states
                    .map { it.state.data })
        }

        // if requester user is admin and requester and target both belong to same org then return all doc belong to target user
        if (requesterUserDetails.role == UserRole.ADMIN &&
                (requesterUserDetails.organizationId == targetUserDetails.organizationId)) {
            val documentsList = documentService.getDocumentsByUserId(targetUserId,
                    pageNo, pageSize)
            return Documents(documentsList.totalStatesAvailable, documentsList.states
                    .map { it.state.data })
        }

        // return documents only those contain requester user in permission list
        val serviceAccount = organizationService.getOrgServiceAccount(
                requesterUserDetails.organizationId).state.data
        return documentService.getUserDocumentsByPermission(requesterUserId,
                targetUserId, serviceAccount.id, pageNo, pageSize)
    }
}
