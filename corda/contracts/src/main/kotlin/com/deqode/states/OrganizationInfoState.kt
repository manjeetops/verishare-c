package com.deqode.states

import com.deqode.contracts.OrganizationInfoContract
import com.deqode.schemas.OrganizationInfoSchemaV1
import com.deqode.schemas.OrganizationInfoSchemaV1.PersistentOrganizationInfo
import com.deqode.schemas.OrganizationStatus
import net.corda.core.contracts.BelongsToContract
import net.corda.core.contracts.LinearState
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.identity.AnonymousParty
import net.corda.core.identity.Party
import net.corda.core.schemas.MappedSchema
import net.corda.core.schemas.PersistentState
import net.corda.core.schemas.QueryableState
import net.corda.core.serialization.CordaSerializable
import java.security.PublicKey

/**
 * A state which records the organization name, identity, status as well as the host on which it exists
 *
 * @property organizationId a UUID for organization that will be used to identify organization by backend
 * @property uniqueName a String to identify name of organization that will be unique
 * @property businessName a String to identify business name of organization name
 * @property description String to store basic description of organization
 * @property status a UUID for organization that will be used to identify organization by backend
 * @property host a Corda node, specified by a [Party] which hosts the account
 */
@BelongsToContract(OrganizationInfoContract::class)
data class OrganizationInfoState(
        val uniqueName: String,
        val businessName: String,
        val description: String,
        val status: OrganizationStatus,
        val host: PublicKey,
        val identifier: UniqueIdentifier,
        val parties: List<AnonymousParty>
) : LinearState, QueryableState {

    override val linearId = identifier

    override var participants = parties

    override fun generateMappedObject(schema: MappedSchema): PersistentState {
        if (schema is OrganizationInfoSchemaV1) {
            return PersistentOrganizationInfo(
                    id = linearId.id,
                    uniqueName = uniqueName,
                    businessName = businessName,
                    description = description,
                    status = status,
                    host = host
            )
        } else {
            throw IllegalStateException("Cannot construct instance of ${this.javaClass} from Schema: $schema")
        }
    }

    override fun supportedSchemas(): Iterable<MappedSchema> {
        return listOf(OrganizationInfoSchemaV1)
    }

    fun modifyStatus(status: OrganizationStatus): OrganizationInfoState {
        return this.copy(status = status)
    }

    fun getSerializedOrganizationInfoState(): SerializedOrganizationInfoState {
        val parties: List<String> = this.parties.map {
            it.toString()
        }
        return SerializedOrganizationInfoState(this.uniqueName, this.businessName, this.description,
                this.status, this.host.toString(), this.identifier, parties)
    }
}

@CordaSerializable
data class SerializedOrganizationInfoState(
        val uniqueName: String,
        val businessName: String,
        val description: String,
        val status: OrganizationStatus,
        val host: String,
        val identifier: UniqueIdentifier,
        val parties: List<String>)

@CordaSerializable
data class OrganizationInfo(val organizationInfoState: OrganizationInfoState,
                            val adminAccountInfo: PublicUserAccountInfoState,
                            val serviceAccountInfo: PublicUserAccountInfoState)

@CordaSerializable
data class SerializedOrganizationInfo(val organizationInfoState: SerializedOrganizationInfoState,
                                      val adminAccountInfo: SerializedPublicUserAccountInfoState,
                                      val serviceAccountInfo: SerializedPublicUserAccountInfoState)

@CordaSerializable
data class CreateOrgRequestData(val orgId: String,
                                val orgUniqueName: String,
                                val businessName: String,
                                val description: String,
                                val adminEmail: String,
                                val adminFirstName: String,
                                val adminLastName: String)

@CordaSerializable
data class UpdateOrgRequestData(val status: OrganizationStatus = OrganizationStatus.ACTIVE)
