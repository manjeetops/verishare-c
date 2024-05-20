import of from 'await-of';
import UserAPIs from '../utils/user';
import CheckHelper from '../helpers/checkHelper';
import {timeStamp} from '../utils/timeStamp'
import { INVITATION_TEST_DATA } from '../testData';

jest.setTimeout(50000);

const orgName = 'deqode';
const URL = `http://localhost:3000/api/v1`;
const MAILHOG_URL = 'http://mailhog-0:8025/api/v2/messages';

let adminAPIResponse;
let inviteData;

describe('Organization Test Started', () => {

  beforeEach(() => {
    const TIMESTAMP = timeStamp()
    inviteData = JSON.parse(JSON.stringify(INVITATION_TEST_DATA));
    inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
    inviteData.firstName = `userSession${TIMESTAMP}`;
    inviteData.lastName = `userSession${TIMESTAMP}`;
  });

  describe('Session Test', () => {
    it('User should be logged out if he was already logged in', async () => {
      const username = 'admin@deqode.com';
      const password = 'string';

      adminAPIResponse = await UserAPIs.login({
        username,
        password,
        URL
      });

      await CheckHelper.checkMessage(
        'loginMsg',
        adminAPIResponse.metaData.message
      );

      const userResponse = await UserAPIs.createUser({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });

      CheckHelper.checkResponseType(userResponse[0]);
      CheckHelper.checkToken(userResponse[0]);
      await CheckHelper.checkMessage(
        'loginMsg',
        userResponse[0].metaData.message
      );

      const logoutResponse = await UserAPIs.logout({
        orgName,
        refreshToken: userResponse[0].result['refresh_token'],
        URL
      });

      await CheckHelper.checkMessage(
        'logoutMsg',
        logoutResponse.metaData.message
      );

      const [refreshToken, err] = await of(
        UserAPIs.getRefreshToken({
          refreshToken: userResponse[0].result['refresh_token'],
          URL
        })
      );

      CheckHelper.checkError(refreshToken, err);
    });


    it('User should not be logged out if refesh token is invalid', async () => {

      const userResponse = await UserAPIs.createUser({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });

      CheckHelper.checkResponseType(userResponse[0]);
      CheckHelper.checkToken(userResponse[0]);
      await CheckHelper.checkMessage(
        'loginMsg',
        userResponse[0].metaData.message
      );

      const [logoutResponse, err] = await of(
        UserAPIs.logout({
          refreshToken: '4375869678',
          URL
        })
      );

      CheckHelper.checkError(logoutResponse, err);
      expect(logoutResponse).toBeUndefined();
    });


    it('User should be blocked by admin only', async () => {

      const userResponse = await UserAPIs.createUser({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });

      CheckHelper.checkResponseType(userResponse[0]);
      CheckHelper.checkToken(userResponse[0]);
      await CheckHelper.checkMessage(
        'loginMsg',
        userResponse[0].metaData.message
      );

      const blockUser = await UserAPIs.blockUser({
        accessToken: adminAPIResponse.result['access_token'],
        userId: userResponse[1].result.id,
        URL
      });

      expect(blockUser.result['status']).toEqual('inactive');
    });


    it('User should not be blocked by another user', async () => {

      const userResponse = await UserAPIs.createUser({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });
      CheckHelper.checkResponseType(userResponse[0]);
      CheckHelper.checkToken(userResponse[0]);
      await CheckHelper.checkMessage(
        'loginMsg',
        userResponse[0].metaData.message
      );

      const TIMESTAMP1 = timeStamp()
      inviteData.email = `userSession${TIMESTAMP1}@gmail.com`;
      const userTwoResponse = await UserAPIs.createUser({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });

      const [blockUser, err] = await of(UserAPIs.blockUser({
        accessToken: userResponse[0].result.access_token,
        userId: userTwoResponse[1].result.id,
        URL
      }));
      CheckHelper.checkError(blockUser, err)
    });


    it('Admin cannot block own account', async () => {
      const adminInfo = await UserAPIs.getAdminInfo({
        accessToken: adminAPIResponse.result['access_token'],
        URL
      });
      const [blockUser, err] = await of(UserAPIs.blockUser({
        accessToken: adminAPIResponse.result['access_token'],
        userId: adminInfo.result.user['account_id'],
        URL
      }));
      CheckHelper.checkError(blockUser, err)
    });


    it('User should not be able to login if it is blocked', async () => {
      
      const userResponse = await UserAPIs.createUser({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });

      CheckHelper.checkResponseType(userResponse[0]);
      CheckHelper.checkToken(userResponse[0]);
      await CheckHelper.checkMessage(
        'loginMsg',
        userResponse[0].metaData.message
      );

      const blockUser = await UserAPIs.blockUser({
        accessToken: adminAPIResponse.result['access_token'],
        userId: userResponse[1].result.id,
        URL
      });

      expect(blockUser.result['status']).toEqual('inactive');

      const [loginResponse, err] = await of(
        UserAPIs.login({
          username: userResponse[1].result.email,
          password: 'Test123',
          URL
        })
      );

      CheckHelper.checkError(loginResponse, err);
    });
  });
});
