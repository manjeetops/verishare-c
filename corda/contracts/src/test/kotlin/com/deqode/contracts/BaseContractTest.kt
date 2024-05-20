package com.deqode.contracts

import net.corda.core.identity.CordaX500Name
import net.corda.testing.core.TestIdentity
import net.corda.testing.node.MockServices

open class BaseContractTest {
    val partyA = TestIdentity(CordaX500Name("PartyA", "London", "GB"))
    val partyB = TestIdentity(CordaX500Name("PartyB", "New York", "US"))
    val ledgerServices = MockServices(partyA, partyB)
}