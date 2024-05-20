package com.deqode.contracts.document

import net.corda.testing.node.ledger
import org.junit.Test
import java.util.*

class DocumentContractUploadTests : BaseDocumentContractTest() {

    @Test
    fun `upload document must have no input state` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(DOCUMENT_CONTRACT_ID, getInputDocumentInfoState())
                    output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                    command(partyA.publicKey, upload)
                    `fails with`("No input to be consumed when uploading document")
                }
                output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                command(partyA.publicKey, upload)
                verifies()
            }
        }
    }

    @Test
    fun `upload document must have one output state` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                    output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                    command(partyA.publicKey, upload)
                    `fails with`("List has more than one element.")
                }
                output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                command(partyA.publicKey, upload)
                verifies()
            }
        }
    }

    @Test
    fun `upload document must have single upload command` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                    command(partyA.publicKey, upload)
                    command(partyA.publicKey, upload)
                    `fails with`("List has more than one element.")
                }
                output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                command(partyA.publicKey, upload)
                verifies()
            }
        }
    }

    @Test
    fun `upload document must have one signer and document owner or admin only` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                    command(listOf(partyA.publicKey, partyB.publicKey), upload)
                    `fails with`("Number of signers must be one while uploading document")
                }
                tweak {
                    output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                    command(partyB.publicKey, upload)
                    `fails with`("Signer must be document owner/admin")
                }
                output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                command(partyA.publicKey, upload)
                verifies()
            }
        }
    }

    @Test
    fun `upload document must have deleted at field should be null` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    val docStateWithDeletedAtNotNull = getOutputDocumentInfoState().copy(deletedAt = Date())
                    output(DOCUMENT_CONTRACT_ID, docStateWithDeletedAtNotNull)
                    command(partyA.publicKey, upload)
                    `fails with`("deletedAt field must be empty while uploading document")
                }
                output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                command(partyA.publicKey, upload)
                verifies()
            }
        }
    }

    @Test
    fun `upload document must have version one` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    val docStateWithVersionNotOne = getOutputDocumentInfoState().copy(version = 2)
                    output(DOCUMENT_CONTRACT_ID, docStateWithVersionNotOne)
                    command(partyA.publicKey, upload)
                    `fails with`("Version must be 1 while uploading document")
                }
                output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                command(partyA.publicKey, upload)
                verifies()
            }
        }
    }

    @Test
    fun `upload document must have permission list empty` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    val docStateWithPermissionNotNull = getOutputDocumentInfoState().copy(permissions = documentAccess)
                    output(DOCUMENT_CONTRACT_ID, docStateWithPermissionNotNull)
                    command(partyA.publicKey, upload)
                    `fails with`("permissions field should be empty while uploading document")
                }
                output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                command(partyA.publicKey, upload)
                verifies()
            }
        }
    }

    @Test
    fun `upload document must have current owner in ownership history and size should be one` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    val docStateWithoutOwnerInOwnershipHistory = getOutputDocumentInfoState().
                            copy(ownershipHistory = documentOwnershipHistoryWithoutOwner)
                    output(DOCUMENT_CONTRACT_ID, docStateWithoutOwnerInOwnershipHistory)
                    command(partyA.publicKey, upload)
                    `fails with`("Current owner must be present in ownershipHistory while uploading document")
                }
                tweak {
                    val docStateWithOwnerAndSizeNotOne = getOutputDocumentInfoState().
                            copy(ownershipHistory = documentOwnershipHistoryWithSizeMoreThanOne)
                    output(DOCUMENT_CONTRACT_ID, docStateWithOwnerAndSizeNotOne)
                    command(partyA.publicKey, upload)
                    `fails with`("Only one owner must present in ownershipHistory while uploading document")
                }
                output(DOCUMENT_CONTRACT_ID, getOutputDocumentInfoState())
                command(partyA.publicKey, upload)
                verifies()
            }
        }
    }
}