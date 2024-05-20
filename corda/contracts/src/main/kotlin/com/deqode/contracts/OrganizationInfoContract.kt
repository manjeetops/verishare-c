package com.deqode.contracts

import com.deqode.schemas.OrganizationStatus
import com.deqode.states.OrganizationInfoState
import net.corda.core.contracts.*
import net.corda.core.transactions.LedgerTransaction
import java.security.PublicKey

class OrganizationInfoContract : Contract {
    companion object {
        @JvmStatic
        val ID = OrganizationInfoContract::class.java.name!!
    }

    interface Commands : CommandData {
        class Create : TypeOnlyCommandData(), Commands
        class UpdateStatus : TypeOnlyCommandData(), Commands
        class UpdateParticipants : TypeOnlyCommandData(), Commands
    }

    override fun verify(tx: LedgerTransaction) {
        val command = tx.commands.requireSingleCommand<Commands>()
        val signers = command.signers.toSet()
        when (command.value) {
            is Commands.Create -> verifyCreateOrganization(tx, signers)
            is Commands.UpdateStatus -> verifyUpdateOrganizationStatus(tx, signers)
            is Commands.UpdateParticipants -> verifyUpdateOrganizationParticipants(tx,
                    signers)
            else -> throw IllegalArgumentException("Invalid command.")
        }

    }

    private fun verifyCreateOrganization(tx: LedgerTransaction, signers: Set<PublicKey>) {
        val outputOrgState = tx.outputsOfType<OrganizationInfoState>().single()

        requireThat {
            // Constraints on the shape of the transaction.
            "No inputs to be consumed when Creating Organization." using (tx.inputs.isEmpty())

            // content specific constraints
            "Status should be active while creating organization" using (outputOrgState.status == OrganizationStatus.ACTIVE)

            // Constraints on the signers.
            "Number of signers should be one." using (signers.size == 1)
            "Signer should be Organization only." using (signers.contains(outputOrgState.host))
        }
    }

    private fun verifyUpdateOrganizationStatus(tx: LedgerTransaction, signers: Set<PublicKey>) {
        val input = tx.inputsOfType<OrganizationInfoState>().single()
        val output = tx.outputsOfType<OrganizationInfoState>().single()

        requireThat {
            // Constraints on the shape of the transaction.

            "Only one organization output should be created." using (tx.outputs.size == 1)
            "Only one organization output should be created." using (tx.inputs.size == 1)

            // Content specific constraints
            "Status should not be same as of the input state." using (input.status != output.status)

            // Constraints on the signers.
            "Number of signers should be one." using (signers.size == 1)
            "Signer should be organization only." using (signers.contains(output.host))
        }
    }

    private fun verifyUpdateOrganizationParticipants(tx: LedgerTransaction, signers:
    Set<PublicKey>) {
        tx.inputsOfType<OrganizationInfoState>().single()
        val output = tx.outputsOfType<OrganizationInfoState>().single()

        requireThat {
            // Constraints on the shape of the transaction.
            "Only one organization output should be created." using (tx.outputs.size == 1)
            "Only one organization output should be created." using (tx.inputs.size == 1)

            // Constraints on the signers.
            "Number of signers should be one." using (signers.size == 1)
            "Signer should be organization only." using (signers.contains(output.host))
        }
    }


}
