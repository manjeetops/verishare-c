import Responder from '../../../../server/expressResponder'
import GetServiceAccounts from '../../../services/serviceAccounts/getServiceAccounts'
import GetServiceAccountCredential from '../../../services/serviceAccounts/getServiceAccountCredential'
import { logAndThrowError } from '../../../utils/error'

export default class ServiceAccountsController {
  static async getServiceAccounts (req, res) {
    const keycloakToken = req.kauth && req.kauth.grant && req.kauth.grant['access_token']
    const [response, err] = await GetServiceAccounts.run({ keycloakToken, ...req.params })
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('Failed to fetch service accounts ', err, res)
    }
  }

  static async getServiceAccountCredential (req, res) {
    const keycloakToken = req.kauth && req.kauth.grant && req.kauth.grant['access_token']
    const [response, err] = await GetServiceAccountCredential.run({ keycloakToken, ...req.params })
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('Failed to fetch service accounts credentials ', err, res)
    }
  }
}
