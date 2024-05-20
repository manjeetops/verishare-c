package com.deqode.contracts

import com.deqode.states.DocumentInfoState
import com.deqode.states.DocumentVersions
import net.corda.core.contracts.*
import net.corda.core.transactions.LedgerTransaction
import java.security.PublicKey

class DocumentContract : Contract {
    companion object {
        @JvmStatic
        val DOCUMENT_CONTRACT_ID = DocumentContract::class.java.name!!
    }

    interface Commands : CommandData {
        class Upload : TypeOnlyCommandData(), Commands
        class ShareAccess : TypeOnlyCommandData(), Commands
        class TransferOwnership : TypeOnlyCommandData(), Commands
        class UpdateVersion : TypeOnlyCommandData(), Commands
        class UpdateDetails : TypeOnlyCommandData(), Commands
        class Freeze : TypeOnlyCommandData(), Commands
        class Delete : TypeOnlyCommandData(), Commands
    }

    override fun verify(tx: LedgerTransaction) {
        val command = tx.commands.requireSingleCommand<Commands>()
        val signers = command.signers.toSet()

        when (command.value) {
            is Commands.Upload -> verifyUpload(tx, signers)
            is Commands.ShareAccess -> verifyShareAccess(tx, signers)
            is Commands.TransferOwnership -> verifyTransferOwnership(tx, signers)
            is Commands.UpdateVersion -> verifyUpdateVersion(tx, signers)
            is Commands.UpdateDetails -> verifyUpdateDetails(tx, signers)
            is Commands.Freeze -> verifyFreeze(tx, signers)
            is Commands.Delete -> verifyDelete(tx, signers)
            else -> throw IllegalArgumentException("Unrecognised command.")
        }
    }

    private fun verifyUpload(tx: LedgerTransaction, signers: Set<PublicKey>) {

        val documentInfoState = tx.outputsOfType<DocumentInfoState>().single()
        val isOwnerPresent = documentInfoState.ownershipHistory?.find { it.userId == documentInfoState.ownerId }

        requireThat {

            // shape constraints
            "No input to be consumed when uploading document" using (tx.inputs.isEmpty())
            "Only one document output should be created" using (tx.outputs.size == 1)

            // content constraints
            "deletedAt field must be empty while uploading document" using (documentInfoState.deletedAt == null)
            "Version must be 1 while uploading document" using (documentInfoState.version == 1)
            "Only one owner must present in ownershipHistory while uploading document" using (documentInfoState.ownershipHistory?.size == 1)
            // check current owner is added or not in ownershipHistory field
            "Current owner must be present in ownershipHistory while uploading document " using (isOwnerPresent != null)
            "permissions field should be empty while uploading document" using (documentInfoState.permissions == null)

            // signer constraints
            "Number of signers must be one while uploading document" using (signers.size == 1)
            "Signer must be document owner/admin" using (signers.containsAll(documentInfoState.signers))
        }
    }

    private fun verifyUpdateDetails(tx: LedgerTransaction, signers: Set<PublicKey>) {

        val inputDocumentInfoState = tx.inputsOfType<DocumentInfoState>().single()
        val outputDocumentInfoState = tx.outputsOfType<DocumentInfoState>().single()
        val outputDocumentInfoStateCopy = inputDocumentInfoState.copy(
                name = outputDocumentInfoState.name,
                url = outputDocumentInfoState.url,
                description = outputDocumentInfoState.description,
                updatedAt = outputDocumentInfoState.updatedAt,
                editorId = outputDocumentInfoState.editorId,
                signers = outputDocumentInfoState.signers)

        requireThat {

            // shape constraints
            "Only one document output should be created while updating document details" using (tx.outputs.size == 1)
            "One input to be consumed while updating document details" using (tx.inputs.size == 1)

            // content constraints
            "updatedAt should be different for input and output state" using (inputDocumentInfoState.updatedAt != outputDocumentInfoState.updatedAt)
            "deletedAt must be null for input and output state" using (inputDocumentInfoState.deletedAt == null && outputDocumentInfoState.deletedAt == null)
            "Only url, description, name can change while updating document state" using (outputDocumentInfoStateCopy == outputDocumentInfoState)

            // signer constraints
            "Number of signers should be one" using (signers.size == 1)
            "Signer must be document owner/admin" using (signers.containsAll(outputDocumentInfoState.signers))
        }
    }

    private fun verifyShareAccess(tx: LedgerTransaction, signers: Set<PublicKey>) {

        val inputDocumentInfoState = tx.inputsOfType<DocumentInfoState>().single()
        val outputDocumentInfoState = tx.outputsOfType<DocumentInfoState>().single()
        val outputDocumentInfoStateCopy = inputDocumentInfoState.copy(
                permissions = outputDocumentInfoState.permissions,
                updatedAt = outputDocumentInfoState.updatedAt,
                signers = outputDocumentInfoState.signers,
                participantsList = outputDocumentInfoState.participantsList)

        requireThat {

            // shape constraints
            "Only one document output should be created while sharing document details" using (tx.outputs.size == 1)
            "One input to be consumed while sharing document details" using (tx.inputs.size == 1)

            // content constraints
            "updatedAt should be different for input and output state" using (inputDocumentInfoState.updatedAt != outputDocumentInfoState.updatedAt)
            "deletedAt must be null for input and output state" using (inputDocumentInfoState.deletedAt == null && outputDocumentInfoState.deletedAt == null)
            "Only permissions can change while sharing document state" using (outputDocumentInfoStateCopy == outputDocumentInfoState)

            // signer constraints
            "Number of signers should be two" using (signers.size == 2)
            "Signer must be document owner/admin and new user" using (signers.containsAll(outputDocumentInfoState.signers))
        }
    }

    private fun verifyTransferOwnership(tx: LedgerTransaction, signers: Set<PublicKey>) {
        val inputDocumentInfoState = tx.inputsOfType<DocumentInfoState>().single()
        val outputDocumentInfoState = tx.outputsOfType<DocumentInfoState>().single()
        val oldOwnerPresent = outputDocumentInfoState.ownershipHistory?.find { it.userId == inputDocumentInfoState.ownerId }
        val newOwnerPresent = outputDocumentInfoState.ownershipHistory?.find { it.userId == outputDocumentInfoState.ownerId }
        val outputDocumentInfoStateCopy = inputDocumentInfoState.copy(
                ownerId = outputDocumentInfoState.ownerId,
                ownershipHistory = outputDocumentInfoState.ownershipHistory,
                updatedAt = outputDocumentInfoState.updatedAt,
                signers = outputDocumentInfoState.signers,
                participantsList = outputDocumentInfoState.participantsList)

        requireThat {
            // shape constraints
            "Only one document output should be created while transferring document ownership" using (tx.outputs.size == 1)
            "One input to be consumed while transferring document ownership" using (tx.inputs.size == 1)

            // content constraints
            "updatedAt should be different for input and output state" using (inputDocumentInfoState.updatedAt != outputDocumentInfoState.updatedAt)
            "deletedAt must be null for input and output state" using (inputDocumentInfoState.deletedAt == null && outputDocumentInfoState.deletedAt == null)
            "old owner and new owner should be different" using (inputDocumentInfoState.ownerId != outputDocumentInfoState.ownerId)
            "old owner and new owner both should be present in ownership history" using (oldOwnerPresent != null && newOwnerPresent != null)
            "Only owner id and ownershipHistory can change while transferring document ownership" using (outputDocumentInfoStateCopy == outputDocumentInfoState)

            // signer constraints
            "Number of signers should be two" using (signers.size == 2)
            "Signer must be document old owner/admin and new owner of document" using (signers.containsAll(outputDocumentInfoState.signers))
        }
    }


    private fun verifyUpdateVersion(tx: LedgerTransaction, signers: Set<PublicKey>) {

        val inputDocumentInfoState = tx.inputsOfType<DocumentInfoState>().single()
        val outputDocumentInfoState = tx.outputsOfType<DocumentInfoState>().single()
        val inputVersionDetails = inputDocumentInfoState.versions.first { it.version ==
                inputDocumentInfoState.version }
        val outputVersionDetails = outputDocumentInfoState.versions.first { it.version ==
                outputDocumentInfoState.version }
        val outputDocumentInfoStateCopy = inputDocumentInfoState.copy(
                version = outputDocumentInfoState.version,
                versions = inputDocumentInfoState.versions.plus(DocumentVersions
                (outputDocumentInfoState.version,
                        outputVersionDetails.size, outputVersionDetails.sha256, outputVersionDetails.type)),
                updatedAt = outputDocumentInfoState.updatedAt,
                signers = outputDocumentInfoState.signers,
                editorId = outputDocumentInfoState.editorId
        )

        requireThat {
            // shape constraints
            "Only one document output should be created while updating document version" using (tx.outputs.size == 1)
            "One input to be consumed while updating document version" using (tx.inputs.size == 1)

            // content constraints
            "updatedAt should be different for input and output state" using (inputDocumentInfoState.updatedAt != outputDocumentInfoState.updatedAt)
            "deletedAt must be null for input and output state" using (inputDocumentInfoState.deletedAt == null && outputDocumentInfoState.deletedAt == null)
            "version must be increased by one only" using (inputDocumentInfoState.version + 1 == outputDocumentInfoState.version)
            "new file must be different from old one" using (outputVersionDetails.sha256 != inputVersionDetails.sha256)
            "Only version and sha256 can change while updating version of document" using (outputDocumentInfoStateCopy == outputDocumentInfoState)

            // signer constraints
            "Number of signers should be one" using (signers.size == 1)
            "Signer must be owner, admin or should be in permission list of document" using (signers.containsAll(outputDocumentInfoState.signers))
        }
    }

    private fun verifyFreeze(tx: LedgerTransaction, signers: Set<PublicKey>) {
        val input = tx.inputsOfType<DocumentInfoState>().single()
        val output = tx.outputsOfType<DocumentInfoState>().single()
        val desiredOutput = input.copy(frozen = output.frozen, updatedAt = output.updatedAt, signers = output.signers)
        requireThat {
            //Constraints on the content of the transaction
            "Document should not be deleted while freezing the document." using (output
                    .deletedAt == null)
            "Cannot update frozen status, document is deleted." using (input.deletedAt ==
                    null)
            "Updated Frozen status should not be same." using (input.frozen != output.frozen)
            "Cannot update document details when updating the frozen status." using
                    (desiredOutput == output)
            //Constraints on the signers
            "Number of signers should be one." using (signers.size == 1)
            "Only admin can freeze the document." using (signers.containsAll(output.signers))
        }
    }

    private fun verifyDelete(tx: LedgerTransaction, signers: Set<PublicKey>) {
        val input = tx.inputsOfType<DocumentInfoState>().single()
        val output = tx.outputsOfType<DocumentInfoState>().single()
        val desiredOutput = input.copy(deletedAt = output.deletedAt, updatedAt = output.updatedAt, signers = output.signers)

        requireThat {
            //Constraints on the content of the transaction
            "deletedAt filed should not be null." using (output.deletedAt != null)
            "Document is already deleted." using (input.deletedAt == null)
            "Cannot update document details while deleting the document" using
                    (desiredOutput == output)
            //Constraints on the signers
            "Number of signers should be one." using (signers.size == 1)
            "Signer should be admin or document owner." using (signers.containsAll(output.signers))
        }
    }
}