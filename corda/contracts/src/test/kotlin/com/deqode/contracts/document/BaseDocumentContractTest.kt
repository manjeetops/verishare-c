package com.deqode.contracts.document

import com.deqode.contracts.BaseContractTest
import com.deqode.contracts.DocumentContract
import com.deqode.states.*
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.crypto.SecureHash
import java.util.*

open class BaseDocumentContractTest: BaseContractTest() {

    val DOCUMENT_CONTRACT_ID = DocumentContract.DOCUMENT_CONTRACT_ID

    val upload = DocumentContract.Commands.Upload()

    val ownerId = UUID.randomUUID()
    val documentOwnershipHistory = mutableSetOf(DocumentOwnershipHistory(ownerId, Date()))
    val documentAccess = mutableSetOf(DocumentAccess(ownerId, Date(), DocumentAccessScope.USER,
            DocumentPermissions.VIEW))

    val documentOwnershipHistoryWithoutOwner = mutableSetOf(DocumentOwnershipHistory(UUID.randomUUID(), Date()))

    val documentOwnershipHistoryWithSizeMoreThanOne = mutableSetOf(
            DocumentOwnershipHistory(UUID.randomUUID(), Date()),
            DocumentOwnershipHistory(ownerId, Date())
    )

    fun getInputDocumentInfoState(): DocumentInfoState {
        return DocumentInfoState(UniqueIdentifier(), ownerId, UUID.randomUUID(), UUID.randomUUID(),
                "passport", "passport document", false, "passport.com", 1,
                "pdf", SecureHash.Companion.sha256("passport"), Date(), Date(), 64, listOf(),
                documentOwnershipHistory, null, mutableListOf(partyA.publicKey), null)
    }

    fun getOutputDocumentInfoState(): DocumentInfoState {
        return DocumentInfoState(UniqueIdentifier(), ownerId, UUID.randomUUID(), UUID.randomUUID(),
                "passport", "passport document", false, "passport.com", 1,
                "pdf", SecureHash.sha256("passport"), Date(), Date(), 64, listOf(),
                documentOwnershipHistory, null, mutableListOf(partyA.publicKey), null)
    }
}