import Invite from '../../../services/invites/invite'
import GetInvitationDetails from '../../../services/invites/getInvitationDetails'
import DeleteInvitation from '../../../services/invites/deleteInvitation'
import UpdateInvitation from '../../../services/invites/updateInvitation'
import GetInvites from '../../../services/invites/getInvites'
import Responder from '../../../../server/expressResponder'
import moment from 'moment'
import { logAndThrowError } from '../../../utils/error'

export default class InvitesController {
  static async invite (req, res) {
    const keycloakToken = req.kauth && req.kauth.grant && req.kauth.grant['access_token']
    const [response, err] = await Invite.run({ ...req.body, keycloakToken })
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('Invite not sent ', err, res)
    }
  }

  static async getInvitationDetails (req, res) {
    const [response, err] = await GetInvitationDetails.run(req.params)
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('Invite not found', err, res)
    }
  }

  static async getInvites (req, res) {
    const [response, err] = await GetInvites.run()
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('Get invites failed', err, res)
    }
  }

  static async deleteInvitation (req, res) {
    const [response, err] = await DeleteInvitation.run({...req.params })
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('Delete invite failed', err, res)
    }
  }

  static async updateInvitation (req, res) {
    const validTill = req.body && req.body.validTill
    if (!moment(validTill).isValid()) {
      return logAndThrowError('Invalid validTill date', new Error('Invitation invalid'), res)
    }
    const reqData = {...req.params, validTill: new Date(validTill) }
    const [response, err] = await UpdateInvitation.run(reqData)
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('Update invite failed', err, res)
    }
  }
}
