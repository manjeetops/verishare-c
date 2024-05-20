package com.deqode.contracts

import com.deqode.schemas.UserRole
import com.deqode.schemas.UserStatus
import com.deqode.states.PublicUserAccountInfoState
import net.corda.core.contracts.*
import net.corda.core.transactions.LedgerTransaction
import java.security.PublicKey

class PublicUserAccountInfoContract : Contract {
    companion object {
        @JvmStatic
        val ID = PublicUserAccountInfoContract::class.java.name!!
    }

    interface Commands : CommandData {
        class Create : TypeOnlyCommandData(), Commands
        class Update : TypeOnlyCommandData(), Commands
        class CreateOrgUsers : TypeOnlyCommandData(), Commands
    }

    override fun verify(tx: LedgerTransaction) {
        val command = tx.commands.requireSingleCommand<Commands>()
        val signers = command.signers.toSet()
        when (command.value) {
            is Commands.Create -> verifyCreateUser(tx, signers)
            is Commands.Update -> verifyUpdateUser(tx, signers)
            is Commands.CreateOrgUsers -> verifyCreateOrgUsers(tx, signers)
            else -> throw IllegalArgumentException("Invalid command.")
        }
    }

    private fun verifyCreateUser(tx: LedgerTransaction, signers: Set<PublicKey>) {
        val output = tx.outputsOfType<PublicUserAccountInfoState>().single()

        requireThat {
            // Constraints on the shape of the transaction.
            "No Inputs should be consumed when creating the User." using (tx.inputsOfType<PublicUserAccountInfoState>()
                    .isEmpty())

            // Content specific constraints
            "Status should be active while creating the user." using (output.status == UserStatus.ACTIVE)

            // Constraints on the signers.
            "Number of signers should be one." using (signers.size == 1)
            "Signer should be organization admin" using (signers.contains(output.adminPublicKey))
        }
    }

    private fun verifyCreateOrgUsers(tx: LedgerTransaction, signers: Set<PublicKey>) {
        val inputs = tx.inputsOfType<PublicUserAccountInfoState>()
        val outputs = tx.outputsOfType<PublicUserAccountInfoState>()

        requireThat {
            // Constraints on the shape of the transaction.
            "No Inputs should be consumed when creating the User." using (inputs.isEmpty())
            "Number of outputs should be two." using (outputs.size == 2)

            // Constraints on the signers.
            "Number of signers should be one." using (signers.size == 1)
            "Signer should be organization admin" using (signers.contains(outputs[0].adminPublicKey))
        }
    }

    private fun verifyUpdateUser(tx: LedgerTransaction, signers: Set<PublicKey>) {
        val input = tx.inputsOfType<PublicUserAccountInfoState>().single()
        val output = tx.outputsOfType<PublicUserAccountInfoState>().single()

        requireThat {
            // Constraints on the shape of the transaction.
            "Only one Input should be consumed when Updating the user." using (tx.inputs
                    .size == 1)
            "Only one Output should be created when Updating the user." using (tx
                    .outputs.size == 1)

            // Content specific constraints
            "Status should not be same as of the input state." using (input.status !=
                    output.status)
            "Admin should not block his own account." using (input.role == UserRole.USER)

            // Constraints on the signers.
            "Number of signers should be One." using (signers.size == 1)
            "Signer should be organization admin" using (signers.contains(output
                    .adminPublicKey))
        }
    }

}
