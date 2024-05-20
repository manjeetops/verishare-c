package com.deqode.states

import com.deqode.contracts.DocumentContract
import com.deqode.schemas.DocumentInfoSchemaV1
import net.corda.core.contracts.BelongsToContract
import net.corda.core.contracts.LinearState
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.crypto.SecureHash
import net.corda.core.identity.AbstractParty
import net.corda.core.schemas.MappedSchema
import net.corda.core.schemas.PersistentState
import net.corda.core.schemas.QueryableState
import net.corda.core.serialization.CordaSerializable
import java.security.PublicKey
import java.util.*

/**
 * A state which records
 *
 * @property
 */

@BelongsToContract(DocumentContract::class)
data class DocumentInfoState(
        val id: UniqueIdentifier = UniqueIdentifier(),
        val ownerId: UUID,
        val ownerOrgId: UUID,
        val editorId: UUID,
        val name: String,
        val description: String,
        val frozen: Boolean,
        val url: String,
        val version: Int,
        val createdAt: Date,
        val updatedAt: Date,
        val participantsList: List<AbstractParty> = listOf(),
        var ownershipHistory: Set<DocumentOwnershipHistory>? = null,
        var permissions: Set<DocumentAccess>? = null,
        val versions: List<DocumentVersions> = mutableListOf(),
        val signers: List<PublicKey> = mutableListOf(),
        val deletedAt: Date? = null
) : LinearState, QueryableState {

    override val linearId: UniqueIdentifier = id

    override var participants: List<AbstractParty> = participantsList

    override fun generateMappedObject(schema: MappedSchema): PersistentState {
        if (schema is DocumentInfoSchemaV1) {
            return DocumentInfoSchemaV1.PersistentDocumentInfo(
                    id = linearId.id,
                    ownerId = ownerId,
                    ownerOrgId = ownerOrgId,
                    editorId = editorId,
                    name = name,
                    description = description,
                    frozen = frozen,
                    url = url,
                    version = version,
                    createdAt = createdAt,
                    updatedAt = updatedAt,
                    deletedAt = deletedAt,
                    signers = signers,
                    ownershipHistory = ownershipHistory?.map {
                        DocumentInfoSchemaV1.PersistentDocumentOwnershipHistory(it.userId, it.timestamp)
                    }?.toSet(),
                    permissions = permissions?.map {
                        DocumentInfoSchemaV1.PersistentDocumentPermissions(it.userId, it.timestamp, it.accessScope, it.accessType)
                    }?.toSet(),
                    previousVersions = versions.map {
                        DocumentInfoSchemaV1.PersistentDocumentVersions(it.version, it
                                .type, it.toString(), it.size)
                    }.toSet()
            )
        } else {
            throw IllegalStateException("Cannot construct instance of ${this.javaClass} from Schema: $schema")
        }
    }

    override fun supportedSchemas(): Iterable<MappedSchema> {
        return listOf(DocumentInfoSchemaV1)
    }

    fun getSerializedDocumentInfoState(): SerializedDocumentInfoState {

        val participantsList = this.participantsList.map { it.toString() }

        val signers = this.signers.map { it.toString() }
        val versions = this.versions.map { SerializedDocumentVersions(it.version, it
                .size, it.sha256.toString(), it.type) }.toSet()
        return SerializedDocumentInfoState(this.id, this.ownerId, this.ownerOrgId, this.editorId, this.name,
                this.description, this.frozen, this.url, this.version, this.createdAt,
                this.updatedAt, participantsList, this.ownershipHistory, this
                .permissions, versions, signers, this.deletedAt)
    }

    fun grantAccess(userId: UUID, scope: DocumentAccessScope, permission: DocumentPermissions): DocumentInfoState {
        // [TODO] improve this
        if (this.permissions == null) {
            this.permissions = setOf(DocumentAccess(userId, Date(), scope, permission))
            return this.copy(permissions = permissions)
        }

        val userAccess = this.permissions?.find { it.userId == userId }

        if (userAccess != null)
            userAccess.accessType = permission
        else this.permissions = permissions?.plus(DocumentAccess(userId, Date(), scope, permission))

        return this.copy(permissions = permissions)
    }
}

@CordaSerializable
enum class DocumentPermissions { VIEW, EDIT }

@CordaSerializable
enum class DocumentAccessScope { USER, ORGANIZATION, NETWORK }

@CordaSerializable
data class DocumentAccess(
        val userId: UUID,
        val timestamp: Date,
        val accessScope: DocumentAccessScope,
        var accessType: DocumentPermissions
)

@CordaSerializable
data class DocumentOwnershipHistory(
        val userId: UUID,
        val timestamp: Date
)

@CordaSerializable
data class DocumentVersions(
        val version: Int, val size: Int, val sha256: SecureHash? = null, val type: String
)

@CordaSerializable
data class Documents(val totalDocuments: Long, val documents: List<DocumentInfoState>)

@CordaSerializable
data class SerializedDocuments(private val totalDocuments: Long, val documents: List<SerializedDocumentInfoState>)

@CordaSerializable
data class SerializedDocumentInfoState(val id: UniqueIdentifier = UniqueIdentifier(),
                                       val ownerId: UUID,
                                       val ownerOrgId: UUID,
                                       val editorId: UUID,
                                       val name: String,
                                       val description: String,
                                       val frozen: Boolean,
                                       val url: String,
                                       val version: Int,
                                       val createdAt: Date,
                                       val updatedAt: Date,
                                       val participantsList: List<String> = listOf(),
                                       var ownershipHistory: Set<DocumentOwnershipHistory>? = null,
                                       var permissions: Set<DocumentAccess>? = null,
                                       val versions: Set<SerializedDocumentVersions>,
                                       val signers: List<String> = mutableListOf(),
                                       val deletedAt: Date? = null)

@CordaSerializable
data class SerializedDocumentVersions(
        val version: Int, val size: Int, val sha256: String, val type: String
)

@CordaSerializable
data class ShareDocumentRequestData(val receiverId: String,
                                    val accessScope: DocumentAccessScope,
                                    val accessType: DocumentPermissions)

@CordaSerializable
data class TransferDocumentRequestData(val newOwnerId: String = "")

@CordaSerializable
data class FreezeDocumentRequestData(val frozen: String = "false")

@CordaSerializable
data class UpdateDocumentRequestData(val url: String = "",
                                     val description: String = "",
                                     val name: String = "")


