package com.deqode.flows.document

import co.paralleluniverse.fibers.Suspendable
import com.deqode.schemas.UserRole
import com.deqode.schemas.UserStatus
import com.deqode.service.documentService
import com.deqode.service.organizationService
import com.deqode.service.userService
import com.deqode.states.*
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.flows.FlowException
import net.corda.core.flows.FlowLogic
import net.corda.core.flows.InitiatingFlow
import net.corda.core.flows.StartableByRPC
import net.corda.core.serialization.CordaSerializable
import java.util.*

@InitiatingFlow
@StartableByRPC
class GetDocumentAllVersionsFlow(
        private val documentId: UniqueIdentifier,
        private val userId: UUID
) : FlowLogic<DocumentDetails>() {

    @Suspendable
    override fun call(): DocumentDetails {

        //Get User Account
        val userDetails = userService.getActiveUserAccountByUserId(userId)?.state?.data
                ?: throw FlowException("User not found: $userId")

        // get document by doc Id
        val documentInfoState = documentService.getDocument(documentId).state.data

        // check user is owner of document or not
        if (documentInfoState.ownerId == userId) {
            return getDocumentAllVersionDetails(documentInfoState)
        }

        // get org id by owner id of document
        val docOrgId = userService.getOrgIdByUserId(documentInfoState.ownerId)

        // check user is admin or not of org related to doc
        val isAdminOrg = userService.isAdminOrg(userDetails, docOrgId)

        if (isAdminOrg) {
            return getDocumentAllVersionDetails(documentInfoState)
        }

        // if user is neither owner of doc not admin org related to doc then check in permission list of doc
        val documentInfoStatePermissionPair = documentService.getUserPermission(documentId, userId, userDetails.organizationId)
        documentInfoStatePermissionPair.second
                ?: throw IllegalStateException("Not enough access to view document: $documentId")

        return getDocumentAllVersionDetails(documentInfoState)
    }

    private fun getDocumentAllVersionDetails(documentInfoState: DocumentInfoState): DocumentDetails {
        val documentAttestations = documentService.getAttestation(documentId.id)?.state?.data
                ?: AttestationInfoState(documentId.id, listOf(), listOf())
        val versions = documentInfoState.versions.map {
            val versionAttestations = getVersionAttestation(it, documentAttestations)
            Version(it.version, it.type, it.sha256
                    .toString(), it.size, versionAttestations)
        }
        val ownershipHistory = documentInfoState.ownershipHistory?.map {
            val userDetails = userService.getUserAccountByUserId(it.userId)?.state?.data
            OwnershipHistory(it.userId, userDetails?.organizationId, userDetails?.organizationName,
                    userDetails?.email, userDetails?.firstName, userDetails?.lastName,
                    userDetails?.status, userDetails?.role, it.timestamp)
        }

        val permissions = documentInfoState.permissions?.map {
            val userDetails = userService.getUserAccountByUserId(it.userId)?.state?.data
            Permission(it.userId, userDetails?.organizationId, userDetails?.organizationName, userDetails?.email, userDetails?.firstName,
                    userDetails?.lastName, userDetails?.status, userDetails?.role, it
                    .timestamp, it.accessScope, it.accessType)
        }

        return DocumentDetails(documentId.id, documentInfoState.name, documentInfoState
                .description, documentInfoState.url, documentInfoState.createdAt, documentInfoState
                .updatedAt, versions, ownershipHistory ?: listOf(), permissions
                ?: listOf(), documentInfoState.frozen, documentInfoState.ownerId)
    }

    private fun getVersionAttestation(versionDetails: DocumentVersions,
                                      documentAttestations:
                                      AttestationInfoState): List<Attestation> {
        val versionAttestations = mutableListOf<Attestation>()
        documentAttestations.attestations.map {
            if (it.version == versionDetails.version) {
                val userDetails = userService.getUserAccountByUserId(it.userId)?.state?.data
                        ?: return@map
                val organizationDetails = organizationService.getOrganizationDetails(userDetails.organizationId)
                val organizationName = organizationDetails?.uniqueName ?: "Not available"
                val attestation = Attestation(userDetails.id, userDetails.firstName,
                        userDetails.lastName, organizationName, it.timestamp)
                versionAttestations.add(attestation)
            }
        }
        return versionAttestations
    }
}

@CordaSerializable
data class DocumentDetails(val documentId: UUID,
                           val name: String,
                           val description: String,
                           val url: String,
                           val createdAt: Date,
                           val updatedAt: Date,
                           val versions: List<Version>,
                           val ownershipHistory: List<OwnershipHistory>,
                           val permissions: List<Permission>,
                           val frozen: Boolean,
                           val ownerId: UUID)

@CordaSerializable
data class Version(val version: Int,
                   val type: String,
                   val sha256: String,
                   val size: Int,
                   val attestations: List<Attestation>)

@CordaSerializable
data class Attestation(val userId: UUID, val firstName: String, val lastName: String,
                       val organizationName: String, val timeStamp: Date)

@CordaSerializable
data class OwnershipHistory(val userId: UUID,
                            val organizationId: UUID? = null,
                            val organizationName: String? = null,
                            val email: String? = null,
                            val firstName: String? = null,
                            val lastName: String? = null,
                            val status: UserStatus? = null,
                            val role: UserRole? = null,
                            val timeStamp: Date)

@CordaSerializable
data class Permission(val userId: UUID,
                      val organizationId: UUID? = null,
                      val organizationName: String? = null,
                      val email: String? = null,
                      val firstName: String? = null,
                      val lastName: String? = null,
                      val status: UserStatus? = null,
                      val role: UserRole? = null,
                      val timestamp: Date,
                      val accessScope: DocumentAccessScope,
                      var accessType: DocumentPermissions)
