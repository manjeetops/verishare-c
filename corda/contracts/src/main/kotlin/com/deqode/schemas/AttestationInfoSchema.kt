package com.deqode.schemas

import net.corda.core.schemas.MappedSchema
import net.corda.core.schemas.PersistentState
import java.util.*
import javax.persistence.*

object AttestationInfoSchema
object AttestationInfoSchemaV1 : MappedSchema(
        schemaFamily = AttestationInfoSchema::class.java,
        version = 1,
        mappedTypes = listOf(PersistentAttestationInfo::class.java)) {
    @Entity
    @Table(name = "attestation", uniqueConstraints = [
    ], indexes = [
        Index(name = "id_idx", columnList = "identifier"),
        Index(name = "document_id_idx", columnList = "document_id")
    ])
    data class PersistentAttestationInfo(
            @Column(name = "identifier", unique = false, nullable = false)
            val id: UUID? = null, // auto generated; linear id

            @Column(name = "document_id", nullable = false)
            val documentId: UUID? = null, // document id; provided by backend

            @Embedded
            @Column(name = "attestationList", nullable = false)
            val attestations: List<PersistentAttestation>? = null
    ) : PersistentState()

    @Embeddable
    data class PersistentAttestation(

            @Column(name = "user_id", nullable = false)
            val userId: UUID? = null, // public id of user

            @Column(name = "version", nullable = false)
            val version: Int? = null, // public id of user

            @Column(name = "timestamp", nullable = false)
            val timestamp: Date? = null // timestamp of creation of document owner
    )
}

