package com.deqode

import net.corda.testing.node.MockNetwork
import net.corda.testing.node.StartedMockNode

open class BaseFlowTest {
    lateinit var network: MockNetwork
    lateinit var partyA: StartedMockNode
    lateinit var partyB: StartedMockNode
    lateinit var partyC: StartedMockNode
}