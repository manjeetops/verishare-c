import MessageHelper from './message'
import { get } from '../helpers/fetchHelper'
import Token from '../../app/services/keycloak/token'
import config from '../../config/app'
import { BACKEND_SERVICE_HOST } from './constants'

const ADMIN_ROLE = `realm:${config.get('org_roles.admin')}`
const EMP_ROLE = `realm:${config.get('org_roles.employee')}`

class CheckHelper {
  static async checkResponseType(response) {
    // Check if response is object type
    expect(typeof response).toBe('object')
    // Check if response contain metaData
    expect(response).toHaveProperty('metaData')
    // Check if response contain result
    expect(response).toHaveProperty('result')
    // Check if result have property id
    expect(response.metaData).toHaveProperty('message')
  }
  static async checkError(response, err) {
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeDefined()
    expect(response).toBeUndefined()
  }
  static async checkMessage(serviceName, responseMsg, msgData) {
    // Fetch message of service method
    const originalMsg = MessageHelper[serviceName](msgData)
    // Check Message
    expect(responseMsg).toEqual(originalMsg)
  }
  static async checkToken(response) {
    // Check If access_token exist
    expect(response.result).toHaveProperty('access_token')
    // Check If refresh_token exist
    expect(response.result).toHaveProperty('refresh_token')
  }
  static async checkAdminRole(token) {
    const tokenInstance = new Token(token, config.get('keycloak.default_client'))
    const isAdmin = tokenInstance.hasRole(ADMIN_ROLE)
    expect(isAdmin).toEqual(true)
  }
  static async checkUserRole(token) {
    const tokenInstance = new Token(token, config.get('keycloak.default_client'))
    const isEmployee = tokenInstance.hasRole(EMP_ROLE)
    expect(isEmployee).toEqual(true)
  }
  static async checkLiveliness() {
    const response = await get({ url: `${BACKEND_SERVICE_HOST}/healthcheck` })
    expect(response).toEqual('OK')
  }
  static async checkUserInfo(userResponse, testData) {
    expect(userResponse.email).toBe(testData.email)
    expect(userResponse.firstName).toBe(testData.firstName)
    expect(userResponse.lastName).toBe(testData.lastName)
  }
}

export default CheckHelper
