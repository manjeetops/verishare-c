package com.deqode.schemas

import net.corda.core.schemas.MappedSchema
import net.corda.core.schemas.PersistentState
import net.corda.core.serialization.CordaSerializable
import java.security.PublicKey
import java.util.*
import javax.persistence.*

object OrganizationInfoSchema

@CordaSerializable
enum class OrganizationStatus { ACTIVE, INACTIVE }

@CordaSerializable
object OrganizationInfoSchemaV1 : MappedSchema(
        schemaFamily = OrganizationInfoSchema::class.java,
        version = 1,
        mappedTypes = listOf(PersistentOrganizationInfo::class.java)) {

    @Entity
    @Table(name = "organization", uniqueConstraints = [
        //TO DO
//        UniqueConstraint(name = "id_constraint", columnNames = ["identifier"]),
//        UniqueConstraint(name = "unique_name_constraint", columnNames = ["unique_name"]),
//        UniqueConstraint(name = "unique_name_and_host_constraint", columnNames = ["host", "unique_name"])
    ], indexes = [
        Index(name = "id_idx", columnList = "identifier"),
        Index(name = "host_idx", columnList = "host"),
        Index(name = "unique_name_idx", columnList = "unique_name")
    ])
    data class PersistentOrganizationInfo(
            @Column(name = "identifier", unique = false, nullable = false) //TO DO
            val id: UUID? = null, // linear id

            @Column(name = "unique_name", unique = false, nullable = false) //TO DO
            val uniqueName: String? = null,

            @Column(name = "business_name", unique = false, nullable = false)
            val businessName: String? = null,

            @Column(name = "description", unique = false, nullable = true)
            val description: String? = null,

            @Column(name = "status", nullable = false)
            @Enumerated(EnumType.STRING)
            val status: OrganizationStatus? = null,

            @Column(name = "host", unique = false, nullable = false) //TO DO
            val host: PublicKey? = null
    ) : PersistentState()
}

