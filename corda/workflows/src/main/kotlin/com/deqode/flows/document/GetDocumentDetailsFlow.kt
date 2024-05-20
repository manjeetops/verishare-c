package com.deqode.flows.document

import co.paralleluniverse.fibers.Suspendable
import com.deqode.service.documentService
import com.deqode.service.userService
import com.deqode.states.DocumentInfoState
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.flows.FlowException
import net.corda.core.flows.FlowLogic
import net.corda.core.flows.InitiatingFlow
import net.corda.core.flows.StartableByRPC
import java.util.*

@InitiatingFlow
@StartableByRPC
class GetDocumentDetailsFlow(
        private val documentId: UniqueIdentifier,
        private val userId: UUID
) : FlowLogic<DocumentInfoState>() {

    @Suspendable
    override fun call(): DocumentInfoState {

        //Get User Account
        val userDetails = userService.getActiveUserAccountByUserId(userId)?.state?.data
                ?: throw FlowException("User not found: $userId")

        // get document by doc Id
        val documentInfoState = documentService.getDocument(documentId).state.data

        // check user is owner of document or not
        if (documentInfoState.ownerId == userId) {
            return documentInfoState
        }

        // get org id by owner id of document
        val docOrgId = userService.getOrgIdByUserId(documentInfoState.ownerId)

        // check user is admin or not of org related to doc
        val isAdminOrg = userService.isAdminOrg(userDetails, docOrgId)

        if (isAdminOrg) {
            return documentInfoState
        }

        // if user is neither owner of doc not admin org related to doc then check in permission list of doc
        val documentInfoStatePermissionPair = documentService.getUserPermission(documentId, userId, userDetails.organizationId)
        documentInfoStatePermissionPair.second
                ?: throw IllegalStateException("Not enough access to view document: $documentId")

        return documentInfoState
    }
}
