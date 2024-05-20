package com.deqode.states

import com.deqode.contracts.PublicUserAccountInfoContract
import com.deqode.schemas.PublicUserAccountInfoSchemaV1
import com.deqode.schemas.PublicUserAccountInfoSchemaV1.PersistentPublicUserAccountInfo
import com.deqode.schemas.UserRole
import com.deqode.schemas.UserStatus
import net.corda.core.contracts.BelongsToContract
import net.corda.core.contracts.LinearState
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.identity.AbstractParty
import net.corda.core.identity.AnonymousParty
import net.corda.core.schemas.MappedSchema
import net.corda.core.schemas.PersistentState
import net.corda.core.schemas.QueryableState
import net.corda.core.serialization.CordaSerializable
import java.security.PublicKey
import java.util.*

/**
 * A state which records
 *
 * @property organizationId
 * @property email
 * @property firstName
 * @property lastName
 * @property status
 * @property role
 * @property parties
 * @property identifier an UUID which should be unique at the corda network level
 */
@BelongsToContract(PublicUserAccountInfoContract::class)
data class PublicUserAccountInfoState(
        val id: UUID,
        val organizationId: UUID,
        val organizationName: String,
        val email: String,
        val firstName: String,
        val lastName: String,
        val status: UserStatus,
        val role: UserRole,
        val adminPublicKey: PublicKey,
        val parties: List<PublicKey>,
        val createdAt: Date,
        val updatedAt: Date
) : LinearState, QueryableState {

    override val linearId: UniqueIdentifier = UniqueIdentifier(id.toString())

    override val participants: List<AbstractParty> get() = parties.map { AnonymousParty(it) }

    override fun generateMappedObject(schema: MappedSchema): PersistentState {
        if (schema is PublicUserAccountInfoSchemaV1) {
            return PersistentPublicUserAccountInfo(
                    id = id,
                    organizationId = organizationId,
                    organizationName = organizationName,
                    email = email,
                    firstName = firstName,
                    lastName = lastName,
                    status = status,
                    role = role,
                    adminPublicKey = adminPublicKey,
                    createdAt = createdAt,
                    updatedAt = updatedAt
            )
        } else {
            throw IllegalStateException("Cannot construct instance of ${this.javaClass} from Schema: $schema")
        }
    }

    override fun supportedSchemas(): Iterable<MappedSchema> {
        return listOf(PublicUserAccountInfoSchemaV1)
    }

    fun updateUser(status: UserStatus, adminPublicKey: PublicKey): PublicUserAccountInfoState {
        return this.copy(status = status, adminPublicKey = adminPublicKey, updatedAt = Date())
    }

    fun getSerializedPublicUserAccountInfo()
            : SerializedPublicUserAccountInfoState {
        val parties: List<String> = this.parties.map {
            it.toString()
        }
        return SerializedPublicUserAccountInfoState(this.id, this.organizationId, this
                .organizationName, this.email, this.firstName,
                this.lastName, this.status, this.role, this.adminPublicKey.toString(), parties, this.createdAt,
                this.updatedAt)
    }
}

@CordaSerializable
data class SerializedPublicUserAccountInfoState(
        val id: UUID,
        val organizationId: UUID,
        val organizationName: String,
        val email: String,
        val firstName: String,
        val lastName: String,
        val status: UserStatus,
        val role: UserRole,
        val adminPublicKey: String,
        val parties: List<String>,
        val createdAt: Date,
        val updatedAt: Date)

@CordaSerializable
data class CreateUserRequestData(val email: String,
                                 val firstName: String,
                                 val lastName: String)

@CordaSerializable
data class UpdateUserRequestData(val status: UserStatus = UserStatus.ACTIVE)

