package com.deqode.contracts.organization

import net.corda.testing.node.ledger
import org.junit.Test


class OrganizationInfoContractUpdateParticipantsTests : BaseOrganizationInfoContractTest() {

    @Test
    fun `update org paricipants must have one input state`() {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(partyA.publicKey, updateParticipants)
                    `fails with`("List is empty.")
                }
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(partyA.publicKey, updateParticipants)
                    `fails with`("List has more than one element.")
                }
                input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, updateParticipants)
                verifies()
            }
        }
    }


    @Test
    fun `update org participants must have one org output state`() {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    command(partyA.publicKey, updateParticipants)
                    `fails with`("List is empty.")
                }
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(partyA.publicKey, updateParticipants)
                    `fails with`("List has more than one element.")
                }
                input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, updateParticipants)
                verifies()
            }
        }
    }

    @Test
    fun `update org participants must have one update command`() {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(partyA.publicKey, updateParticipants)
                    command(partyA.publicKey, updateParticipants)
                    `fails with`("List has more than one element.")
                }
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    `fails with`("A transaction must contain at least one command")
                }
                input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, updateParticipants)
                verifies()
            }
        }
    }

    @Test
    fun `update org participants must have one signer and host only`(){
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(listOf(partyA.publicKey,partyB.publicKey), updateParticipants)
                    `fails with`("Number of signers should be one.")
                }
                tweak {
                    input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                    output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                    command(listOf(partyB.publicKey), updateParticipants)
                    `fails with`("Signer should be Organization only.")
                }
                input(ORGANIZATION_CONTRACT_ID, getInputOrgState())
                output(ORGANIZATION_CONTRACT_ID, getOutputOrgState())
                command(partyA.publicKey, updateParticipants)
                verifies()
            }
        }
    }
}