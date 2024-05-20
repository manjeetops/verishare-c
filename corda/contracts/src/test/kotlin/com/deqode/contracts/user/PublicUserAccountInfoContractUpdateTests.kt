package com.deqode.contracts.user

import com.deqode.schemas.UserStatus
import net.corda.testing.node.ledger
import org.junit.Test

class PublicUserAccountInfoContractUpdateTests: BasePublicUserAccountInfoContractTest() {

    @Test
    fun `update user must have one user input state` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    command(partyA.publicKey, update)
                    `fails with`("List is empty.")
                }
                input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                command(partyA.publicKey, update)
                verifies()
            }
        }
    }

    @Test
    fun `update user must have one user output state` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    command(partyA.publicKey, update)
                    `fails with`("List has more than one element.")
                }
                input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                command(partyA.publicKey, update)
                verifies()
            }
        }
    }

    @Test
    fun `update user must have one create command` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    command(partyA.publicKey, update)
                    command(partyA.publicKey, update)
                    `fails with`("List has more than one element")
                }
                input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                command(partyA.publicKey, update)
                verifies()
            }
        }
    }

    @Test
    fun `update user must have one signer and admin only` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    command(listOf(partyA.publicKey, partyB.publicKey), update)
                    `fails with`("Number of signers should be one")
                }
                tweak {
                    input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                    command(partyB.publicKey, update)
                    `fails with`("Signer should be organization admin")
                }
                input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                command(partyA.publicKey, update)
                verifies()
            }
        }
    }

    @Test
    fun `update user must change status` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    val publicUserAccountInfoStateWithInactiveState = getInputUserAccountInfoState().copy(status = UserStatus.INACTIVE)
                    input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, publicUserAccountInfoStateWithInactiveState)
                    command(partyA.publicKey, update)
                    `fails with`("Status should not be same as of the input state.")
                }
                input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                command(partyA.publicKey, update)
                verifies()
            }
        }
    }

    @Test
    fun `update user must have input role user` () {
        ledgerServices.ledger {
            transaction {
                tweak {
                    input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputAdminAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputAdminAccountInfoState())
                    command(listOf(partyA.publicKey, partyB.publicKey), update)
                    `fails with`("Admin should not block his own account.")
                }
                tweak {
                    input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputServiceAccountInfoState())
                    output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputServiceAccountInfoState())
                    command(partyB.publicKey, update)
                    `fails with`("Admin should not block his own account.")
                }
                input(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getInputUserAccountInfoState())
                output(PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID, getOutputUserAccountInfoState())
                command(partyA.publicKey, update)
                verifies()
            }
        }
    }
}