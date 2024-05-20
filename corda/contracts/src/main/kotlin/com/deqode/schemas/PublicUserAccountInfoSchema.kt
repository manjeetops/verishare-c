package com.deqode.schemas

import net.corda.core.schemas.MappedSchema
import net.corda.core.schemas.PersistentState
import net.corda.core.serialization.CordaSerializable
import java.security.PublicKey
import java.util.*
import javax.persistence.*

object PublicUserAccountInfoSchema

@CordaSerializable
enum class UserStatus { ACTIVE, INACTIVE }

@CordaSerializable
enum class UserRole { USER, ADMIN, SERVICE }

@CordaSerializable
object PublicUserAccountInfoSchemaV1 : MappedSchema(
        schemaFamily = PublicUserAccountInfoSchema::class.java,
        version = 1,
        mappedTypes = listOf(PersistentPublicUserAccountInfo::class.java)) {

    @Entity
    @Table(name = "public_user_account", uniqueConstraints = [
    ], indexes = [
        Index(name = "id_idx", columnList = "identifier"),
        Index(name = "organization_id_idx", columnList = "organization_id"),
        Index(name = "role_idx", columnList = "role")
    ])
    data class PersistentPublicUserAccountInfo(
            @Column(name = "identifier", unique = false, nullable = false) //TO DO
            val id: UUID? = null, // account id generated using Accounts "AccountInfo"

            @Column(name = "organization_id", unique = false, nullable = false)
            val organizationId: UUID? = null, // organization id to which user belongs;

            @Column(name = "organization_name", unique = false, nullable = false)
            val organizationName: String? = null, // organization name to which user belongs;

            @Column(name = "email", unique = false, nullable = false) //TO DO
            val email: String? = null, // user's email address

            @Column(name = "first_name", unique = false, nullable = false)
            val firstName: String? = null, // user's first name

            @Column(name = "last_name", unique = false, nullable = false)
            val lastName: String? = null, // user's last name

            @Column(name = "status", nullable = false)
            @Enumerated(EnumType.STRING)
            val status: UserStatus? = null, // user's account status

            @Column(name = "role", nullable = false)
            @Enumerated(EnumType.STRING)
            val role: UserRole? = null, // user's account role (Admin, User or Service)

            @Column(name = "admin_public_key", unique = false, nullable = false)
            val adminPublicKey: PublicKey? = null, // admin's public key

            @Column(name = "created_at", nullable = false)
            val createdAt: Date? = null, // creation date of user

            @Column(name = "updated_at", nullable = false)
            val updatedAt: Date? = null // last updated at

    ) : PersistentState()
}
