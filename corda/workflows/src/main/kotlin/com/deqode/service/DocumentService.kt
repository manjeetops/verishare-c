package com.deqode.service

import com.deqode.schemas.AttestationInfoSchemaV1
import com.deqode.schemas.DocumentInfoSchemaV1
import com.deqode.schemas.UserRole
import com.deqode.states.*
import net.corda.core.contracts.StateAndRef
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.flows.FlowException
import net.corda.core.node.AppServiceHub
import net.corda.core.node.services.CordaService
import net.corda.core.node.services.Vault
import net.corda.core.node.services.queryBy
import net.corda.core.node.services.vault.*
import net.corda.core.node.services.vault.Builder.equal
import net.corda.core.node.services.vault.Builder.isNull
import net.corda.core.serialization.SingletonSerializeAsToken
import net.corda.core.utilities.contextLogger
import java.util.*


@CordaService
class DocumentService(val service: AppServiceHub) : SingletonSerializeAsToken() {
    companion object {
        val logger = contextLogger()
    }

    // Get document by document Id
    fun getDocument(documentId: UniqueIdentifier): StateAndRef<DocumentInfoState> {
        val idCriteria = QueryCriteria.LinearStateQueryCriteria(
                status = Vault.StateStatus.UNCONSUMED,
                linearId = listOf(documentId)
        )
        val statusSelector = DocumentInfoSchemaV1.PersistentDocumentInfo::deletedAt.isNull()
        val statusCriteria = QueryCriteria.VaultCustomQueryCriteria(statusSelector)
        val customCriteria = idCriteria.and(statusCriteria)
        return service.vaultService.queryBy<DocumentInfoState>(customCriteria).states.firstOrNull()
                ?: throw FlowException("Could not find document: $documentId")
    }

    // Get all organization documents
    fun getOrganizationDocuments(orgId: UUID, pageNo: Int = 1, pageSize: Int = 10):
            Vault.Page<DocumentInfoState> {
        val sortAttribute = SortAttribute.Custom(DocumentInfoSchemaV1
                .PersistentDocumentInfo::class.java, DocumentInfoSchemaV1
                .PersistentDocumentInfo::createdAt.name)
        val sorter = Sort(setOf(Sort.SortColumn(sortAttribute, Sort.Direction.DESC)))
        val statusSelector = DocumentInfoSchemaV1.PersistentDocumentInfo::deletedAt.isNull()
        val orgSelector = DocumentInfoSchemaV1.PersistentDocumentInfo::ownerOrgId.equal(orgId)
        val statusCriteria = QueryCriteria.VaultCustomQueryCriteria(statusSelector)
        val orgCriteria = QueryCriteria.VaultCustomQueryCriteria(orgSelector)
        val customCriteria = statusCriteria.and(orgCriteria)
        return service.vaultService.queryBy(customCriteria,
                PageSpecification(pageNo, pageSize), sorter)

    }

    // Get all the documents owned by specific user
    fun getDocumentsByUserId(userId: UUID, pageNo: Int = 1, pageSize: Int = 10):
            Vault.Page<DocumentInfoState> {
        val sortAttribute = SortAttribute.Custom(DocumentInfoSchemaV1
                .PersistentDocumentInfo::class.java, DocumentInfoSchemaV1
                .PersistentDocumentInfo::createdAt.name)
        val sorter = Sort(setOf(Sort.SortColumn(sortAttribute, Sort.Direction.DESC)))
        val statusSelector = DocumentInfoSchemaV1.PersistentDocumentInfo::deletedAt.isNull()
        val userSelector = DocumentInfoSchemaV1.PersistentDocumentInfo::ownerId.equal(userId)
        val statusCriteria = QueryCriteria.VaultCustomQueryCriteria(statusSelector)
        val userCriteria = QueryCriteria.VaultCustomQueryCriteria(userSelector)
        val customCriteria = statusCriteria.and(userCriteria)
        return service.vaultService.queryBy(customCriteria,
                PageSpecification(pageNo, pageSize), sorter)
    }

    // Get the permission of the document for user
    fun getUserPermission(documentId: UniqueIdentifier, userId: UUID, orgId: UUID):
            Pair<StateAndRef<DocumentInfoState>, DocumentAccess?> {
        val document = this.getDocument(documentId)
        // if no permissions exist then return null
        document.state.data.permissions ?: return Pair(document, null)
        val permission = document.state.data.permissions?.find { it.userId == userId }
        return Pair(
                document,
                permission ?: document.state.data.permissions?.find { it.userId == orgId }
        )
    }

    // Get all the documents that a specific user has access to
    fun getDocumentsByUserPermission(userId: UUID, serviceAccountId: UUID, pageNo: Int =
            1, pageSize: Int = 10): Documents {

        //TODO: Correct total states available
        val sortAttribute = SortAttribute.Custom(DocumentInfoSchemaV1
                .PersistentDocumentInfo::class.java, DocumentInfoSchemaV1
                .PersistentDocumentInfo::createdAt.name)
        val sorter = Sort(setOf(Sort.SortColumn(sortAttribute, Sort.Direction.DESC)))

        val documentStates = builder {
            val idCriteria = QueryCriteria.VaultQueryCriteria(Vault.StateStatus.UNCONSUMED, externalIds =
            listOf(userId, serviceAccountId))
            val statusSelector = DocumentInfoSchemaV1.PersistentDocumentInfo::deletedAt.isNull()
            val ownerSelector = DocumentInfoSchemaV1.PersistentDocumentInfo::ownerId
                    .notEqual(userId)
            val statusCriteria = QueryCriteria.VaultCustomQueryCriteria(statusSelector)
            val ownerCriteria = QueryCriteria.VaultCustomQueryCriteria(ownerSelector)
            val customCriteria = statusCriteria.and(ownerCriteria).and(idCriteria)
            service.vaultService.queryBy<DocumentInfoState>(customCriteria,
                    PageSpecification(pageNo, pageSize), sorter)
        }

        return Documents(documentStates.totalStatesAvailable, documentStates.states.map { it.state.data })
    }

    // Get the documents of a particular user that the requester has access to
    fun getUserDocumentsByPermission(userId: UUID, targetUserId: UUID, serviceAccountId: UUID,
                                     pageNo: Int = 1, pageSize: Int = 10): Documents {
        val sortAttribute = SortAttribute.Custom(DocumentInfoSchemaV1
                .PersistentDocumentInfo::class.java, DocumentInfoSchemaV1
                .PersistentDocumentInfo::createdAt.name)
        val sorter = Sort(setOf(Sort.SortColumn(sortAttribute, Sort.Direction.DESC)))

        val documentStates = builder {
            val idCriteria = QueryCriteria.VaultQueryCriteria(Vault.StateStatus.UNCONSUMED, externalIds =
            listOf(userId, serviceAccountId))
            val statusSelector = DocumentInfoSchemaV1.PersistentDocumentInfo::deletedAt.isNull()
            val ownerSelector = DocumentInfoSchemaV1.PersistentDocumentInfo::ownerId
                    .equal(targetUserId)
            val statusCriteria = QueryCriteria.VaultCustomQueryCriteria(statusSelector)
            val ownerCriteria = QueryCriteria.VaultCustomQueryCriteria(ownerSelector)
            val customCriteria = statusCriteria.and(ownerCriteria).and(idCriteria)
            service.vaultService.queryBy<DocumentInfoState>(customCriteria,
                    PageSpecification(pageNo, pageSize), sorter)
        }

        return Documents(documentStates.totalStatesAvailable, documentStates.states.map { it.state.data })
    }

    // Check whether user has edit access to the document
    fun hasEditDocumentAccess(document: DocumentInfoState, initiatorAccountPublicInfo: PublicUserAccountInfoState): Boolean {
        val userId = initiatorAccountPublicInfo.id
        val documentId = document.id
        if (userId != document.ownerId && initiatorAccountPublicInfo.role != UserRole.ADMIN) {
            document.permissions
                    ?: throw FlowException("User $userId does not have permission to edit document $documentId")

            val permission = document.permissions?.find { it.userId == userId }

            if (permission == null) {
                val orgLevelPermission = document.permissions?.find { it.userId == initiatorAccountPublicInfo.organizationId }
                orgLevelPermission
                        ?: throw FlowException("User $userId does not have permission to edit document $documentId")

                if (orgLevelPermission.accessType != DocumentPermissions.EDIT) {
                    throw FlowException("User $userId does not have permission to edit document $documentId")
                }
            }

            if (permission?.accessType != DocumentPermissions.EDIT) {
                throw FlowException("User $userId does not have permission to edit document $documentId")
            }
        }

        return true
    }

    //Get attestations of the document
    fun getAttestation(documentId: UUID): StateAndRef<AttestationInfoState>? {
        val idSelector = AttestationInfoSchemaV1.PersistentAttestationInfo::documentId
                .equal(documentId)
        val criteria = QueryCriteria.VaultCustomQueryCriteria(idSelector)
        return service.vaultService.queryBy<AttestationInfoState>(criteria).states.firstOrNull()
    }

}
