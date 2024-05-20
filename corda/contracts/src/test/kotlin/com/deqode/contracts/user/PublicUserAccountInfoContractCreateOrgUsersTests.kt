package com.deqode.contracts.user

import net.corda.testing.node.ledger
import org.junit.Test

class PublicUserAccountInfoContractCreateOrgUsersTests: BasePublicUserAccountInfoContractTest() {

    @Test
    fun `create org user must have no user input state` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputAdminAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputServiceAccountInfoState())
                    command(partyA.publicKey, createOrgUsers)
                    `fails with`("No Inputs should be consumed when creating the User.")
                }
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputAdminAccountInfoState())
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputServiceAccountInfoState())
                command(partyA.publicKey, createOrgUsers)
                verifies()
            }
        }
    }

    @Test
    fun `create org user must have two user output state` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    command(partyA.publicKey, createOrgUsers)
                    `fails with`("Number of outputs should be two.")
                }
                tweak {
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputAdminAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputServiceAccountInfoState())
                    command(partyA.publicKey, createOrgUsers)
                    `fails with`("Number of outputs should be two.")
                }
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputAdminAccountInfoState())
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputServiceAccountInfoState())
                command(partyA.publicKey, createOrgUsers)
                verifies()
            }
        }
    }

    @Test
    fun `create org user must have one create org command` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputAdminAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputServiceAccountInfoState())
                    command(partyA.publicKey, createOrgUsers)
                    command(partyA.publicKey, createOrgUsers)
                    `fails with`("List has more than one element")
                }
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputAdminAccountInfoState())
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputServiceAccountInfoState())
                command(partyA.publicKey, createOrgUsers)
                verifies()
            }
        }
    }

    @Test
    fun `create org user must have one signer and admin only` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputAdminAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputServiceAccountInfoState())
                    command(listOf(partyA.publicKey, partyB.publicKey), createOrgUsers)
                    `fails with`("Number of signers should be one")
                }
                tweak {
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputAdminAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputServiceAccountInfoState())
                    command(partyB.publicKey, createOrgUsers)
                    `fails with`("Signer should be organization admin")
                }
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputAdminAccountInfoState())
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputServiceAccountInfoState())
                command(partyA.publicKey, createOrgUsers)
                verifies()
            }
        }
    }
}