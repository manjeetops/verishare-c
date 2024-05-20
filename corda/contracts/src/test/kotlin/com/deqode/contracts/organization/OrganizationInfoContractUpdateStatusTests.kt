package com.deqode.contracts.organization

import com.deqode.schemas.OrganizationStatus
import net.corda.testing.node.ledger
import org.junit.Test

class OrganizationInfoContractUpdateStatusTests : BaseOrganizationInfoContractTest() {

    @Test
    fun `update org status must have one input state`() {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(partyA.publicKey, updateStatus)
                    `fails with`("List is empty.")
                }
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(partyA.publicKey, updateStatus)
                    `fails with`("List has more than one element.")
                }
                input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, updateStatus)
                verifies()
            }
        }
    }

    @Test
    fun `update org status must have one org output state`() {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    command(partyA.publicKey, updateStatus)
                    `fails with`("List is empty.")
                }
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(partyA.publicKey, updateStatus)
                    `fails with`("List has more than one element.")
                }
                input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, updateStatus)
                verifies()
            }
        }
    }

    @Test
    fun `update org status must have one update command`() {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(partyA.publicKey, updateStatus)
                    command(partyA.publicKey, updateStatus)
                    `fails with`("List has more than one element.")
                }
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    `fails with`("A transaction must contain at least one command")
                }
                input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, updateStatus)
                verifies()
            }
        }
    }

    @Test
    fun `update org status must have one signer and host only`(){
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(listOf(partyA.publicKey,partyB.publicKey), updateStatus)
                    `fails with`("Number of signers should be one.")
                }
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(listOf(partyB.publicKey), updateStatus)
                    `fails with`("Signer should be Organization only.")
                }
                input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, updateStatus)
                verifies()
            }
        }
    }

    @Test
    fun `update org status must have different output status`() {
        ledgerServices.ledger {
            transaction {
                tweak {
                    val orgStateWithInactiveStatus = getOutputOrgState().copy(status = OrganizationStatus.INACTIVE)
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, orgStateWithInactiveStatus)
                    command(listOf(partyA.publicKey), updateStatus)
                    `fails with`("Status should not be same as of the input state.")
                }
                input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, updateStatus)
                verifies()
            }
        }
    }
}