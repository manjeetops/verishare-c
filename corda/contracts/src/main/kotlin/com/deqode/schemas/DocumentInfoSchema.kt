package com.deqode.schemas

import com.deqode.states.DocumentAccessScope
import com.deqode.states.DocumentPermissions
import net.corda.core.schemas.MappedSchema
import net.corda.core.schemas.PersistentState
import net.corda.core.serialization.CordaSerializable
import java.security.PublicKey
import java.util.*
import javax.persistence.*

object DocumentInfoSchema


@CordaSerializable
object DocumentInfoSchemaV1 : MappedSchema(
        schemaFamily = DocumentInfoSchema::class.java,
        version = 1,
        mappedTypes = listOf(
                PersistentDocumentInfo::class.java,
                PersistentDocumentOwnershipHistory::class.java,
                PersistentDocumentPermissions::class.java,
                PersistentDocumentVersions::class.java
        )
) {

    @Entity
    @Table(name = "document", uniqueConstraints = [
    ], indexes = [
        Index(name = "id_idx", columnList = "identifier"),
        Index(name = "owner_id_idx", columnList = "owner_id")
    ])
    data class PersistentDocumentInfo(
            @Column(name = "identifier", nullable = false)
            val id: UUID? = null, // document Id; linear id

            @Column(name = "owner_id", nullable = false)
            val ownerId: UUID? = null, // public id of user

            @Column(name = "owner_org_id", nullable = false)
            val ownerOrgId: UUID? = null, // owner organization id

            @Column(name = "editor_id", nullable = false)
            val editorId: UUID? = null, // public id of user which edited its current version

            @Column(name = "name", nullable = false)
            val name: String? = null, // name of document

            @Column(name = "description", nullable = false)
            val description: String? = null, // description of document

            @Column(name = "frozen")
            val frozen: Boolean? = null, // is document frozen

            @Column(name = "url", nullable = true)
            val url: String? = null, // url of document (optional)

            @Column(name = "version", nullable = false)
            val version: Int? = null, // current version of document

            @Column(name = "created_at", nullable = false)
            val createdAt: Date? = null, // creation date of document

            @Column(name = "updated_at", nullable = false)
            val updatedAt: Date? = null, // last updated at

            @Column(name = "deleted_at", nullable = true)
            val deletedAt: Date? = null, // deleted at

            @Embedded
            val ownershipHistory: Set<PersistentDocumentOwnershipHistory>? = setOf(),

            @Embedded
            val permissions: Set<PersistentDocumentPermissions>? = setOf(),

            @Embedded
            val signers: List<PublicKey> = mutableListOf(),

            @Embedded
            val previousVersions: Set<PersistentDocumentVersions>? = setOf()
    ) : PersistentState()

    @Embeddable
    data class PersistentDocumentOwnershipHistory(

            @Column(name = "user_id", nullable = false)
            val userId: UUID? = null, // public id of user

            @Column(name = "timestamp", nullable = false)
            val timestamp: Date? = null // timestamp of creation of document owner
    )

    @Embeddable
    data class PersistentDocumentPermissions(

            @Column(name = "user_id", nullable = false)
            val userId: UUID? = null, // public id of user

            @Column(name = "timestamp", nullable = false)
            val timestamp: Date? = null, // timestamp of when permission is granted to user

            @Column(name = "access_scope", nullable = false)
            @Enumerated(EnumType.STRING)
            val scope: DocumentAccessScope? = null, // document access scope

            @Column(name = "access_type", nullable = false)
            @Enumerated(EnumType.STRING)
            val accessType: DocumentPermissions? = null // document account permission
    )

    @Embeddable
    data class PersistentDocumentVersions(

            @Column(name = "version", nullable = false)
            val version: Int? = null, // current version of document

            @Column(name = "type", nullable = false)
            val type: String? = null, // document type; extension

            @Column(name = "document_sha", nullable = false)
            val sha256: String? = null, // sha of document

            @Column(name = "size", nullable = false)
            val size: Int? = null // size of document; bytes
    )
}
