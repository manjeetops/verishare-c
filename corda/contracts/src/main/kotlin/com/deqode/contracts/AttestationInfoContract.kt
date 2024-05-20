package com.deqode.contracts

import com.deqode.states.AttestationInfoState
import net.corda.core.contracts.*
import net.corda.core.transactions.LedgerTransaction
import java.security.PublicKey

class AttestationInfoContract : Contract {
    companion object {
        @JvmStatic
        val ID = AttestationInfoContract::class.java.name!!
    }

    interface Commands : CommandData {
        class Create : TypeOnlyCommandData(), Commands
    }

    override fun verify(tx: LedgerTransaction) {
        val command = tx.commands.requireSingleCommand<Commands>()
        val signers = command.signers.toSet()
        when (command.value) {
            is Commands.Create -> verifyAttestDocument(tx, signers)
            else -> throw IllegalArgumentException("Invalid command.")
        }
    }

    private fun verifyAttestDocument(tx: LedgerTransaction, signers: Set<PublicKey>) {
        requireThat {
            // Constraints on the shape of the transaction.
            "Number of inputs should be zero or one." using (tx
                    .inputsOfType<AttestationInfoState>().size < 2)
            "Number of outputs should be one." using (tx
                    .outputsOfType<AttestationInfoState>().size == 1)

            // Constraints on the signers.
            "Number of signers should be one." using (signers.size == 1)
        }
    }
}