import Signup from '../../../services/user/signup'
import Responder from '../../../../server/expressResponder'
import GetUserInfo from '../../../services/user/getUserInfo'
import LoginUser from '../../../services/user/login'
import LogoutUser from '../../../services/user/logout'
import GetNewAccessToken from '../../../services/user/getNewAccessToken'
import { logAndThrowError } from '../../../utils/error'

export default class UserController {
  static async login (req, res) {
    const [response, err] = await LoginUser.run({ ...req.body, ...req.params })
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('User login failed', err, res)
    }
  }

  static async signup (req, res) {
    const [response, err] = await Signup.run({ ...req.body, admin: req.admin })
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('User not registered', err, res)
    }
  }

  static async getUserInfo (req, res) {
    const keycloakToken = req.kauth && req.kauth.grant && req.kauth.grant['access_token']
    const { sub: keycloakSubId } = keycloakToken.content;

    const [response, err] = await GetUserInfo.run({ keycloakSubId })
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('Failed to fetch user details', err, res)
    }
  }

  static async getNewAccessToken (req, res) {
    const refreshToken = req.body['refresh_token']
    const [response, err] = await GetNewAccessToken.run({ refreshToken })
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('Failed to fetch the new access token', err, res)
    }
  }

  static async logout (req, res) {
    // const keycloakToken = req.kauth && req.kauth.grant && req.kauth.grant['access_token']
    const [response, err] = await LogoutUser.run({
      ...req.body,
      ...req.params
    })
    if (response) {
      Responder.sendJSONResponse(res, response)
    } else {
      logAndThrowError('Failed to logout the user', err, res)
    }
  }
}
