import { post } from '../helpers/fetchHelper'
import { BLOCKCHAIN_BASE_URL } from '../helpers/constants'
import config from '../../config/app'

class BlockchainAPIs {
  static async createAccountOnBlockchain () {
    const data = {
      path: config.get('blockchain.transaction_data.path'),
      permissions: config.get('blockchain.transaction_data.permissions'),
      wait: config.get('blockchain.transaction_data.wait'),
      nonce: config.get('blockchain.transaction_data.nonce')
    }
    const response = await post({
      rootToken: config.get('blockchain.vault.root_token'),
      url: `${BLOCKCHAIN_BASE_URL}/account`,
      opts: {
        body: data
      }
    })
    return response
  }
}

export default BlockchainAPIs
