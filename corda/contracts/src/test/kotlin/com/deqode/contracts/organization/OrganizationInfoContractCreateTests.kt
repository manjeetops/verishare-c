package com.deqode.contracts.organization

import com.deqode.schemas.OrganizationStatus
import net.corda.testing.node.ledger
import org.junit.After
import org.junit.Before
import org.junit.Test

class OrganizationInfoContractCreateTests: BaseOrganizationInfoContractTest() {

    @Before
    fun setup() {
    }

    @After
    fun tearDown() {
    }

    @Test
    fun `create org must have no input state`() {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(partyA.publicKey, create)
                    `fails with`("No inputs to be consumed when Creating Organization.")
                }
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, create)
                verifies()
            }
        }
    }

    @Test
    fun `create org must have one org output state`() {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(partyA.publicKey, create)
                    `fails with`("List has more than one element.")
                }
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, create)
                verifies()
            }
        }
    }

    @Test
    fun `create org must have one create command`() {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(partyA.publicKey, create)
                    command(partyA.publicKey, create)
                    `fails with`("List has more than one element.")
                }
                tweak {
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    `fails with`("A transaction must contain at least one command")
                }
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, create)
                verifies()
            }
        }
    }

    @Test
    fun `create org must have one signer and host only`(){
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(listOf(partyA.publicKey,partyB.publicKey), create)
                    `fails with`("Number of signers should be one.")
                }
                tweak {
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(listOf(partyB.publicKey), create)
                    `fails with`("Signer should be Organization only.")
                }
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, create)
                verifies()
            }
        }
    }

    @Test
    fun `create org must have active status`() {
        ledgerServices.ledger {
            transaction {
                tweak {
                    val orgStateWithInactiveStatus = getOutputOrgState().copy(status = OrganizationStatus.INACTIVE)
                    output(ORGANIZATION_CONTRACT_ID, orgStateWithInactiveStatus)
                    command(listOf(partyA.publicKey), create)
                    `fails with`("Status should be active while creating organization")
                }
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, create)
                verifies()
            }
        }
    }
}