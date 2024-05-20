package com.deqode.contracts.user

import com.deqode.schemas.UserStatus
import net.corda.testing.node.ledger
import org.junit.Test

class PublicUserAccountInfoContractCreateTests: BasePublicUserAccountInfoContractTest() {

    @Test
    fun `create user must have no user input state` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    command(partyA.publicKey, create)
                    `fails with`("No Inputs should be consumed when creating the User.")
                }
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                command(partyA.publicKey, create)
                verifies()
            }
        }
    }

    @Test
    fun `create user must have one user output state` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    command(partyA.publicKey, create)
                    `fails with`("List has more than one element.")
                }
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                command(partyA.publicKey, create)
                verifies()
            }
        }
    }

    @Test
    fun `create user must have one create command` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    command(partyA.publicKey, create)
                    command(partyA.publicKey, create)
                    `fails with`("List has more than one element")
                }
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                command(partyA.publicKey, create)
                verifies()
            }
        }
    }

    @Test
    fun `create user must have one signer and admin only` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    command(listOf(partyA.publicKey, partyB.publicKey), create)
                    `fails with`("Number of signers should be one")
                }
                tweak {
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    command(partyB.publicKey, create)
                    `fails with`("Signer should be organization admin")
                }
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                command(partyA.publicKey, create)
                verifies()
            }
        }
    }

    @Test
    fun `create user must have active status` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    val publicUserAccountInfoStateWithInactiveState = getOutputUserAccountInfoState().copy(status = UserStatus.INACTIVE)
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, publicUserAccountInfoStateWithInactiveState)
                    command(partyA.publicKey, create)
                    `fails with`("Status should be active while creating the user.")
                }
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                command(partyA.publicKey, create)
                verifies()
            }
        }
    }
}