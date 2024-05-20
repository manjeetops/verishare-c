export const createWalletResponse = {
  id: 'walletOne',
  amount: 108
}

export const getWalletsResponse = {
  content: [
    {
      id: 'WalletTwo',
      amount: 108
    },
    {
      id: 'WalletThree',
      amount: 101
    }
  ]
}

export const purchaseCoinsResponse = {
  walletId: 'walletOne',
  amount: 108
}

export const setOptionsResponse = {
  txnId: 'txnId'
}

export const spendCoinsResponse = {
  txnId: 'txnId'
}

export const getOptionsResponses = {
  registration: 101,
  customer: 'testCustomer'
}

export const getTransactionsResponse = {
  content: [
    {
      walletId: 'walletOne',
      amount: 101,
      creationDate: 20190320,
      customer: 'testCustomer1',
      txId: 'testTxnId1',
      type: 'walletType1'
    },
    {
      walletId: 'walletTwo',
      amount: 108,
      creationDate: 20190321,
      customer: 'testCustomer2',
      txId: 'testTxnId2',
      type: 'walletType2'
    }
  ]
}

export const getTreasureTransactionsResponse = {
  content: [
    {
      amount: 108,
      creationDate: 20190320,
      customer: 'testCustomer1',
      txId: 'testTxnId1',
      type: 'txnType1'
    },
    {
      amount: 108,
      creationDate: 20190320,
      customer: 'testCustomer2',
      txId: 'testTxnId2',
      type: 'txnType2'
    }
  ]
}

export const getTreasureBalanceResponse = {
  balance: 1008
}
