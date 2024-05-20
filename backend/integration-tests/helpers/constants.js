import config from '../../config/app'

const NAMESPACE = 'api/v1'
// backend service host
const BACKEND_SERVICE_HOST = `http://localhost:3000`
// sawtooth api service host
const BLOCKCHAIN_BASE_URL = config.get('blockchain.base_url')
// backend url
const URL = `${BACKEND_SERVICE_HOST}/${NAMESPACE}`
// const URL = `https://rokk3r-org1.ml/${NAMESPACE}`

export {
  URL,
  BLOCKCHAIN_BASE_URL,
  BACKEND_SERVICE_HOST
}
