package com.deqode.flows.general

import co.paralleluniverse.fibers.Suspendable
import net.corda.core.contracts.ContractState
import net.corda.core.contracts.StateAndRef
import net.corda.core.flows.*
import net.corda.core.identity.Party
import net.corda.core.node.StatesToRecord

class ShareStateFlow<T : ContractState>(
        val state: StateAndRef<T>,
        val hostSession: FlowSession
) : FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        val transaction = serviceHub.validatedTransactions.getTransaction(state.ref.txhash)
                ?: throw FlowException("Can't find transaction with hash ${state.ref.txhash}")
        subFlow(SendTransactionFlow(hostSession, transaction))
    }
}

/**
 * Responder flow for [ShareStateFlow].
 */
class ReceiveStateFlow(val otherSession: FlowSession) : FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        subFlow(ReceiveTransactionFlow(otherSession, statesToRecord = StatesToRecord.ALL_VISIBLE))
    }
}

// Initiating versions of the above flows.

@StartableByRPC
@StartableByService
@InitiatingFlow
class ShareStatesFlow<T : ContractState>(
        val accountInfo: List<Party>,
        val states: List<StateAndRef<T>>
) : FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        for (receiver in accountInfo) {
            for (stateToBroadcast in states) {
                val hostSession = initiateFlow(receiver)
                subFlow(ShareStateFlow(stateToBroadcast, hostSession))
            }
        }

    }
}

@InitiatedBy(ShareStatesFlow::class)
class ReceiveStateForAccount(val otherSession: FlowSession) : FlowLogic<Unit>() {
    @Suspendable
    override fun call() = subFlow(ReceiveStateFlow(otherSession))
}