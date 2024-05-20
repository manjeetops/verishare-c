package com.deqode.flows.attestation

import co.paralleluniverse.fibers.Suspendable
import com.deqode.schemas.UserRole
import com.deqode.service.documentService
import com.deqode.service.userService
import com.deqode.states.AttestationInfoState
import com.deqode.states.DocumentInfoState
import com.r3.corda.lib.accounts.workflows.accountService
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.flows.*
import net.corda.core.utilities.unwrap
import java.util.*

@InitiatingFlow
@StartableByRPC
class GetDocumentAttestationsFlow(private val documentId: UniqueIdentifier,
                                  private val userId: UUID) : FlowLogic<AttestationInfoState>() {

    @Suspendable
    override fun call(): AttestationInfoState {
        //Check document permission
        val document = checkDocumentPermission()

        //Create session with documentOwner
        val session = documentOwnerSession(document) ?: return documentService
                .getAttestation(documentId.id)?.state?.data
                ?: return AttestationInfoState(documentId.id, listOf(), listOf())

        //Get attestations
        return getAttestations(session)
    }

    private fun checkDocumentPermission(): DocumentInfoState {
        val userAccountInfoState = userService.getActiveUserAccountByUserId(userId)?.state?.data
                ?: throw FlowException("User not found: $userId")
        val documentPermission = documentService.getUserPermission(documentId,
                userId, userAccountInfoState.organizationId)

        if (documentPermission.first.state.data.frozen) {
            throw FlowException("Document is frozen, cannot view attestations")
        }

        if (documentPermission.second == null && documentPermission.first.state.data.ownerId != userId) {
            val ownerAccountInfoState = userService.getActiveUserAccountByUserId(documentPermission.first.state.data.ownerId)
                    ?.state?.data
                    ?: throw FlowException("Document owner not found: ${documentPermission.first.state.data.ownerId}")

            if (userAccountInfoState.role != UserRole.ADMIN &&
                    ownerAccountInfoState.organizationId != userAccountInfoState.organizationId)
                documentPermission.second
                        ?: throw FlowException("You don't have permission to " +
                                "view attestations of this document")
        }

        return documentPermission.first.state.data
    }

    private fun documentOwnerSession(document: DocumentInfoState): FlowSession? {
        val owner = accountService.accountInfo(document.ownerId)
                ?: throw FlowException("Document owner not found")
        if (owner.state.data.host != ourIdentity) {
            return initiateFlow(owner.state.data.host)
        }
        return null
    }

    @Suspendable
    private fun getAttestations(session: FlowSession): AttestationInfoState {
        return session.sendAndReceive<AttestationInfoState>(documentId.id).unwrap { it }
    }
}

@InitiatedBy(GetDocumentAttestationsFlow::class)
class ShareAttestationFlowResponder(private val otherPartySession: FlowSession) : FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        val documentId = otherPartySession.receive<UUID>().unwrap { it }
        println(documentId)
        val attestation = documentService.getAttestation(documentId)?.state?.data
                ?: AttestationInfoState(documentId, listOf(), listOf())
        otherPartySession.send(attestation)
    }

}