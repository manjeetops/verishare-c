import UserAPIs from '../utils/user';
import CheckHelper from '../helpers/checkHelper';
import { dbStatus } from '../utils/status';
import {
  INVITATION_TEST_DATA
} from '../testData';

jest.setTimeout(50000);
let org1AdminAPIResponse;
let org2AdminAPIResponse;
let org1UserResponse;
let org2UserResponse;

const TIMESTAMP = new Date().getTime();
const ORG_1_MAILHOG_URL = 'http://mailhog-0:8025/api/v2/messages'
const ORG_2_MAILHOG_URL = 'http://mailhog-1:8025/api/v2/messages'

describe('Organization Test Started', () => {
  describe('User onboarding tests', () => {
    beforeAll(async () => {
      org1AdminAPIResponse = await UserAPIs.login({
        username: 'admin@boeing.com',
        password: 'string',
        URL: `http://backend-1:3000/api/v1`
      });
      // Check message
      await CheckHelper.checkMessage(
        'loginMsg',
        org1AdminAPIResponse.metaData.message
      );

      org2AdminAPIResponse = await UserAPIs.login({
        username: 'admin@deqode.com',
        password: 'string',
        URL: `http://localhost:3000/api/v1`
      });
      // Check message
      await CheckHelper.checkMessage(
        'loginMsg',
        org2AdminAPIResponse.metaData.message
      );
      let inviteData1 = JSON.parse(JSON.stringify(INVITATION_TEST_DATA));
      inviteData1.email = `org1User1${TIMESTAMP}@gmail.com`;
      inviteData1.firstName = `org1User1${TIMESTAMP}`;
      inviteData1.lastName = `org1User1${TIMESTAMP}`;

      org1UserResponse = await UserAPIs.createUser({
        accessToken: org1AdminAPIResponse.result['access_token'],
        invitationData: inviteData1,
        URL: `http://backend-1:3000/api/v1`,
        mailhogUrl: ORG_2_MAILHOG_URL
      });

      const getUserResponse = await dbStatus('getUser', {
        accessToken: org2AdminAPIResponse.result['access_token'],
        userId: org1UserResponse[1].result.id,
        URL: `http://localhost:3000/api/v1`
      });

      CheckHelper.checkResponseType(getUserResponse)

      let inviteData2 = JSON.parse(JSON.stringify(INVITATION_TEST_DATA));
      inviteData2.email = `org2User1${TIMESTAMP}@gmail.com`;
      inviteData2.firstName = `org2User1${TIMESTAMP}`;
      inviteData2.lastName = `org2User1${TIMESTAMP}`;

      org2UserResponse = await UserAPIs.createUser({
        accessToken: org2AdminAPIResponse.result['access_token'],
        invitationData: inviteData2,
        URL: `http://localhost:3000/api/v1`,
        mailhogUrl: ORG_1_MAILHOG_URL
      });

      const getUserResponse1 = await dbStatus('getUser', {
        accessToken: org1AdminAPIResponse.result['access_token'],
        userId: org2UserResponse[1].result.id,
        URL: `http://backend-1:3000/api/v1`
      });

      CheckHelper.checkResponseType(getUserResponse1)

      // Check response type
      CheckHelper.checkResponseType(org1UserResponse[0]);
      // Check response type
      CheckHelper.checkToken(org1UserResponse[0]);
      // Check message
      await CheckHelper.checkMessage(
        'loginMsg',
        org1UserResponse[0].metaData.message
      );

      // Check response type
      CheckHelper.checkResponseType(org2UserResponse[0]);
      // Check response type
      CheckHelper.checkToken(org2UserResponse[0]);
      // Check message
      await CheckHelper.checkMessage(
        'loginMsg',
        org2UserResponse[0].metaData.message
      );
    });

    it('orgnization-1 user should able to view the details of organization-2', async () => {

      let org2User = await UserAPIs.getUserDetails({
        accessToken: org1UserResponse[0].result['access_token'],
        userId: org2UserResponse[1].result['id'],
        URL: `http://backend-1:3000/api/v1`
      });

      expect(org2User.metaData.message).toEqual(
        'User details have been successfully fetched'
      );

      expect(org2User.result.account_id).toEqual(
        org2UserResponse[1].result['id']
      );
    });

    it('orgnization-1 user should able to view all the users of organization-2', async () => {
      let org2Users = await UserAPIs.getOrgUsers({
        orgName: 'deqode',
        accessToken: org1UserResponse[0].result['access_token'],
        URL: `http://backend-1:3000/api/v1`
      });

      expect(org2Users.metaData.message).toEqual(
        'Users have been successfully fetched'
      );
    });
  });
});
