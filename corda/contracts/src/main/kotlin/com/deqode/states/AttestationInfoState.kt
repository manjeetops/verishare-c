package com.deqode.states
import com.deqode.contracts.AttestationInfoContract
import com.deqode.schemas.AttestationInfoSchemaV1
import com.deqode.schemas.AttestationInfoSchemaV1.PersistentAttestationInfo
import com.deqode.schemas.DocumentInfoSchemaV1
import net.corda.core.contracts.BelongsToContract
import net.corda.core.contracts.LinearState
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.identity.AnonymousParty
import net.corda.core.schemas.MappedSchema
import net.corda.core.schemas.PersistentState
import net.corda.core.schemas.QueryableState
import net.corda.core.serialization.CordaSerializable
import java.security.PublicKey
import java.security.Timestamp
import java.util.*
/**
 * A state which records
 *
 * @property documentId
 * @property userId
 * @property parties
 */
@BelongsToContract(AttestationInfoContract::class)
data class AttestationInfoState(
        val documentId: UUID,
        val attestations: List<Attestation>,
        val parties: List<PublicKey>
) : LinearState, QueryableState {
    override val linearId: UniqueIdentifier = UniqueIdentifier()
    override val participants: List<AnonymousParty> get() = parties.map { AnonymousParty(it) }
    override fun generateMappedObject(schema: MappedSchema): PersistentState {
        if (schema is AttestationInfoSchemaV1) {
            return PersistentAttestationInfo(
                    id = linearId.id,
                    documentId = documentId,
                    attestations = attestations.map {
                        AttestationInfoSchemaV1.PersistentAttestation(it.userId, it
                                .version,it.timestamp)
                    }
            )
        } else {
            throw IllegalStateException("Cannot construct instance of ${this.javaClass} from Schema: $schema")
        }
    }
    override fun supportedSchemas(): Iterable<MappedSchema> {
        return listOf(AttestationInfoSchemaV1)
    }

    fun getSerializedAttestationInfoState(): SerializedAttestationInfoState{
        val parties = this.parties.map {
            it.toString()
        }
        return SerializedAttestationInfoState(this.documentId, this.attestations, parties)
    }
}

@CordaSerializable
data class Attestation(val userId: UUID,
                       val version: Int,
                       val timestamp: Date)

@CordaSerializable
data class SerializedAttestationInfoState(val documentId: UUID,
                                          val attestations: List<Attestation>,
                                          val parties: List<String>)
@CordaSerializable
data class AttestDocumentRequestData(val version: String = "1")