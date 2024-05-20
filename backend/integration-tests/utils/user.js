import { post, get, put } from '../helpers/fetchHelper';
import { dbStatus } from '../utils/status';
import InvitationAPIs from '../utils/invitation';
import of from 'await-of';
import CheckHelper from '../helpers/checkHelper';

const BLOCKCHAIN_ERR_MSG =
  'User not registered: Transaction was submitted, but client timed out before it was committed. Check for block';

class UserAPIs {
  static async login({ username, password, URL }) {
    const response = await post({
      url: `${URL}/protocol/openid-connect/login`,
      opts: {
        body: { username, password }
      }
    });

    return response;
  }

  static async signUp({ invitationCode, firstName, lastName, password, URL }) {
    const response = await post({
      url: `${URL}/signup`,
      opts: {
        body: { invitationCode, firstName, lastName, password }
      }
    });
    return response;
  }

  static async logout({ refreshToken, URL }) {
    const response = await post({
      url: `${URL}/protocol/openid-connect/logout`,
      opts: {
        body: { refresh_token: refreshToken }
      }
    });
    return response;
  }

  static async blockUser({ accessToken, userId, URL }) {
    const response = await put({
      accessToken,
      url: `${URL}/users/${userId}/block`
    });
    return response;
  }

  static async createUser({ accessToken, invitationData, URL, mailhogUrl }) {
    let inviteResponse = await InvitationAPIs.sendInvitation({
      accessToken,
      invitationData,
      URL
    });
    const email = invitationData.email;
    let invitationCode = await InvitationAPIs.getInvitationCode({email, position: 0, url: mailhogUrl});

    await dbStatus('getInvitation', {
      accessToken,
      invitationCode,
      URL
    });

    let username = invitationData.email;
    let firstName = invitationData.firstName;
    let lastName = invitationData.lastName;
    let password = 'Test123';
    let sign = await UserAPIs.signUp({
      invitationCode,
      firstName,
      lastName,
      password,
      URL
    });

    CheckHelper.checkResponseType(sign);

    const response = await dbStatus('getUser', {
      accessToken,
      userId: sign.result.id,
      URL
    });

    CheckHelper.checkResponseType(response);

    let loginResponse = await UserAPIs.login({
      username,
      password,
      URL
    });
    return [loginResponse, sign];
  }

  static async getAdminInfo({ accessToken, URL }) {
    const response = await get({
      accessToken,
      url: `${URL}/user-info`
    });
    return response;
  }

  static async getOrgUsers({ orgName, accessToken, URL }) {
    const response = await get({
      accessToken,
      url: `${URL}/${orgName}/users`
    });
    return response;
  }

  static async getUserDetails({ accessToken, userId, URL }) {
    const response = await get({
      accessToken,
      url: `${URL}/users/${userId}`
    });
    return response;
  }

  static async getRefreshToken({ refreshToken, URL }) {
    const response = await post({
      url: `${URL}/protocol/openid-connect/token`,
      opt: { body: { refreshToken } }
    });
    return response;
  }
}

export default UserAPIs;
