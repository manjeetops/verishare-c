import of from 'await-of';
import uuidv4 from 'uuid/v4';
import InvitationAPIs from '../utils/invitation';
import UserAPIs from '../utils/user';
import { dbStatus } from '../utils/status';
import CheckHelper from '../helpers/checkHelper';
import {
  CREATE_ORGANIZATION_TEST_DATA,
  INVITATION_TEST_DATA
} from '../testData';
import { timeStamp } from '../utils/timeStamp';

jest.setTimeout(50000);

const URL = `http://localhost:3000/api/v1`;
const MAILHOG_URL = 'http://mailhog-0:8025/api/v2/messages';

let adminAPIResponse;
let inviteData = JSON.parse(JSON.stringify(INVITATION_TEST_DATA));

describe('Organization Test Started', () => {
  let org = { testData: CREATE_ORGANIZATION_TEST_DATA };

  describe('User onboarding tests', () => {
    it('Admin user should be able to login with correct credentials', async () => {
      const username = 'admin@deqode.com';
      const password = 'string';
      adminAPIResponse = await UserAPIs.login({
        username,
        password,
        URL
      });

      CheckHelper.checkResponseType(adminAPIResponse);
      CheckHelper.checkToken(adminAPIResponse);
      await CheckHelper.checkMessage(
        'loginMsg',
        adminAPIResponse.metaData.message
      );
      await CheckHelper.checkAdminRole(adminAPIResponse.result['access_token']);
      org.adminCredentials = adminAPIResponse;
    });

    it('Admin user should not be able to login with incorrect credentials', async () => {
      const [loginAPIResponse, err] = await of(
        UserAPIs.login({
          username: 'incorrect@gmail.com',
          password: 'incorrect',
          URL
        })
      );
      CheckHelper.checkError(loginAPIResponse, err);
    });

    it('Only admin can invite user', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const inviteResponse = await InvitationAPIs.sendInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL
      });
      CheckHelper.checkResponseType(inviteResponse);
    });

    it('User cannot be invited if he already joined the organization', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const inviteResponse = await InvitationAPIs.sendInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL
      });
      CheckHelper.checkResponseType(inviteResponse);

      const invitationCode = await InvitationAPIs.getInvitationCode({
        email: inviteData.email,
        position: 0,
        url: MAILHOG_URL
      });
      await dbStatus('getInvitation', {
        accessToken: adminAPIResponse.result['access_token'],
        invitationCode,
        URL
      });

      const signup = await UserAPIs.signUp({
        invitationCode,
        firstName: `user${TIMESTAMP}`,
        lastName: `user${TIMESTAMP}`,
        password: 'Test123',
        URL
      });

      CheckHelper.checkResponseType(signup);

      const getUserResponse = await dbStatus('getUser', {
        accessToken: adminAPIResponse.result['access_token'],
        userId: signup.result.id,
        URL
      });

      CheckHelper.checkResponseType(getUserResponse);

      const [response, err1] = await of(
        InvitationAPIs.sendInvitation({
          accessToken: adminAPIResponse.result['access_token'],
          invitationData: inviteData,
          URL
        })
      );
      CheckHelper.checkError(response, err1);
    });

    it('non admin can not invite user', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const userResponse = await UserAPIs.createUser({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });

      const [inviteResponse, err] = await of(
        InvitationAPIs.sendInvitation({
          accessToken: userResponse[0].result['access_token'],
          invitationData: inviteData,
          URL
        })
      );
      CheckHelper.checkError(inviteResponse, err);
    });

    it('Only admin can view all the invites', async () => {
      const invites = await InvitationAPIs.getAllInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        URL
      });
      CheckHelper.checkResponseType(invites);
      expect(invites.metaData.message).toEqual(
        'Invitations details has been successfully fetched.'
      );
    });

    it('non admin cannot view all the invites', async () => {
      const TIMESTAMP = timeStamp();
      const accessToken = adminAPIResponse.result['access_token'];
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const response = await UserAPIs.createUser({
        accessToken,
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });
      CheckHelper.checkResponseType(response[0]);

      let [invites, err] = await of(
        InvitationAPIs.getAllInvitation({
          accessToken: response[0].result.access_token,
          URL
        })
      );
      CheckHelper.checkError(invites, err);
    });

    it('Invitations can be updated by admin only', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const sentInviteResponse = await InvitationAPIs.sendInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL
      });

      const inviteResponse = await InvitationAPIs.updateInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationId: sentInviteResponse.result['invitation_id'],
        URL
      });

      CheckHelper.checkResponseType(inviteResponse);
    });

    it('Invitations cannot be updated by non admin', async () => {
      const TIMESTAMP = timeStamp();
      const TIMESTAMP1 = timeStamp();
      const accessToken = adminAPIResponse.result['access_token'];
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const sentInviteResponse = await InvitationAPIs.sendInvitation({
        accessToken,
        invitationData: inviteData,
        URL
      });

      inviteData.email = `userSession${TIMESTAMP1}@gmail.com`;
      const response = await UserAPIs.createUser({
        accessToken,
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });
      CheckHelper.checkResponseType(response[0]);

      const [inviteResponse, err] = await of(
        InvitationAPIs.updateInvitation({
          accessToken: response[0].result.access_token,
          invitationId: sentInviteResponse.result['invitation_id'],
          URL
        })
      );
      CheckHelper.checkError(inviteResponse, err);
    });

    it('admin should not be able to update the invitation if user has aleady joined', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const inviteResponse = await InvitationAPIs.sendInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL
      });
      CheckHelper.checkResponseType(inviteResponse);

      const invitationCode = await InvitationAPIs.getInvitationCode({
        email: inviteData.email,
        position: 0,
        url: MAILHOG_URL
      });
      await dbStatus('getInvitation', {
        accessToken: adminAPIResponse.result['access_token'],
        invitationCode,
        URL
      });

      const signup = await UserAPIs.signUp({
        invitationCode,
        firstName: `user${TIMESTAMP}`,
        lastName: `user${TIMESTAMP}`,
        password: 'Test123',
        URL
      });

      CheckHelper.checkResponseType(signup);

      const getUserResponse = await dbStatus('getUser', {
        accessToken: adminAPIResponse.result['access_token'],
        userId: signup.result.id,
        URL
      });

      CheckHelper.checkResponseType(getUserResponse);

      const [response, err1] = await of(
        InvitationAPIs.updateInvitation({
          accessToken: adminAPIResponse.result['access_token'],
          invitationId: inviteResponse.result['invitation_id'],
          URL
        })
      );
      CheckHelper.checkError(response, err1);
    });

    it('Invitation code should be valid to view user invites details', async () => {
      const [invites, err] = await of(
        InvitationAPIs.getInvitation({
          accessToken: adminAPIResponse.result['access_token'],
          invitationCode:
            '3364f68e3fd5be1f62260e7f82175bbffdb931886db87de0111822c3b80ce62e',
          URL
        })
      );
      CheckHelper.checkError(invites, err);
    });

    it('Should be able to get invitation details with correct payload', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const inviteResponse = await InvitationAPIs.sendInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL
      });
      CheckHelper.checkResponseType(inviteResponse);

      const invitationCode = await InvitationAPIs.getInvitationCode({
        email: inviteData.email,
        position: 0,
        url: MAILHOG_URL
      });
      await dbStatus('getInvitation', {
        accessToken: adminAPIResponse.result['access_token'],
        invitationCode,
        URL
      });

      const invites = await InvitationAPIs.getInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationCode,
        URL
      });
      CheckHelper.checkResponseType(invites);
    });

    it('Invitations can be deleted by admin only', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const sentInviteResponse = await InvitationAPIs.sendInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL
      });

      await InvitationAPIs.deleteInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationId: sentInviteResponse.result['invitation_id'],
        URL
      });
      const invitationCode = await InvitationAPIs.getInvitationCode({
        email: inviteData.email,
        position: 0,
        url: MAILHOG_URL
      });
      const [invites, err] = await of(
        InvitationAPIs.getInvitation({
          accessToken: adminAPIResponse.result['access_token'],
          invitationCode,
          URL
        })
      );
      CheckHelper.checkError(invites, err);
    });

    it('Invitations cannot be deleted by non admin', async () => {
      const TIMESTAMP = timeStamp();
      const accessToken = adminAPIResponse.result['access_token'];
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const sentInviteResponse = await InvitationAPIs.sendInvitation({
        accessToken,
        invitationData: inviteData,
        URL
      });

      const response = await UserAPIs.createUser({
        accessToken,
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });

      const [invitationResponse, err] = await of(
        InvitationAPIs.deleteInvitation({
          accessToken: response[0].result['access_token'],
          invitationId: sentInviteResponse.result['invitation_id'],
          URL
        })
      );
      CheckHelper.checkError(invitationResponse, err);
    });

    it('Invitation cannot be deleted if invitation id is invalid', async () => {
      const accessToken = adminAPIResponse.result['access_token'];
      const [invitationResponse, err] = await of(
        InvitationAPIs.deleteInvitation({
          accessToken,
          invitationId: uuidv4(),
          URL
        })
      );
      CheckHelper.checkError(invitationResponse, err);
    });

    it('Invitations can not be deleted if user has already joined', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const sentInviteResponse = await InvitationAPIs.sendInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL
      });

      const invitationCode = await InvitationAPIs.getInvitationCode({
        email: inviteData.email,
        position: 0,
        url: MAILHOG_URL
      });
      await dbStatus('getInvitation', {
        accessToken: adminAPIResponse.result['access_token'],
        invitationCode,
        URL
      });

      const signup = await UserAPIs.signUp({
        invitationCode,
        firstName: `user2a${TIMESTAMP}`,
        lastName: `user2a${TIMESTAMP}`,
        password: 'Test123',
        URL
      });

      CheckHelper.checkResponseType(signup);

      const getUserResponse = await dbStatus('getUser', {
        accessToken: adminAPIResponse.result['access_token'],
        userId: signup.result.id,
        URL
      });

      CheckHelper.checkResponseType(getUserResponse);

      const [deleteInviteResponse, err1] = await of(
        InvitationAPIs.deleteInvitation({
          accessToken: adminAPIResponse.result['access_token'],
          invitationId: sentInviteResponse.result['invitation_id'],
          URL
        })
      );
      CheckHelper.checkError(deleteInviteResponse, err1);
      expect(deleteInviteResponse).toBeUndefined();

      const invites = await InvitationAPIs.getInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationCode,
        URL
      });
      expect(invites).toBeDefined();
    });

    it('User should sign up with correct credentials', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const sentInviteResponse = await InvitationAPIs.sendInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL
      });

      const invitationCode = await InvitationAPIs.getInvitationCode({
        email: inviteData.email,
        position: 0,
        url: MAILHOG_URL
      });

      await dbStatus('getInvitation', {
        accessToken: adminAPIResponse.result['access_token'],
        invitationCode,
        URL
      });

      const userSignup = await UserAPIs.signUp({
        invitationCode,
        firstName: `user3a${TIMESTAMP}`,
        lastName: `user3a${TIMESTAMP}`,
        password: 'Test123',
        URL
      });

      await CheckHelper.checkResponseType(userSignup);
      await CheckHelper.checkMessage(
        'signUpMsg',
        userSignup.metaData.message,
        userSignup.result['email']
      );

      const response = await dbStatus('getUser', {
        accessToken: adminAPIResponse.result['access_token'],
        userId: userSignup.result.id,
        URL
      });
      CheckHelper.checkResponseType(response);
    });

    it('User should not be able to sign up if invitation code is incorrect', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const sentInviteResponse = await InvitationAPIs.sendInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL
      });
      const [signup, err] = await of(
        UserAPIs.signUp({
          invitationCode: 'invitationCode',
          firstName: `user4${TIMESTAMP}`,
          lastName: `user4${TIMESTAMP}`,
          password: 'Test123',
          URL
        })
      );

      CheckHelper.checkError(signup, err);
    });

    it('User should not be able to signup if already joined', async () => {
      const TIMESTAMP = timeStamp();
      const TIMESTAMP1 = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const firstInviteResponse = await InvitationAPIs.sendInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL
      });

      inviteData.email = `userSession${TIMESTAMP1}@gmail.com`;
      const secondInviteResponse = await InvitationAPIs.sendInvitation({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL
      });
      CheckHelper.checkResponseType(secondInviteResponse);

      const secondInvitationCode = await InvitationAPIs.getInvitationCode({
        email: inviteData.email,
        position: 0,
        url: MAILHOG_URL
      });
      await dbStatus('getInvitation', {
        accessToken: adminAPIResponse.result['access_token'],
        invitationCode: secondInvitationCode,
        URL
      });

      const firstInvitationCode = await InvitationAPIs.getInvitationCode({
        email: inviteData.email,
        position: 0,
        url: MAILHOG_URL
      });
      const userSignup = await UserAPIs.signUp({
        invitationCode: firstInvitationCode,
        firstName: `user3a${TIMESTAMP}`,
        lastName: `user3a${TIMESTAMP}`,
        password: 'Test123',
        URL
      });

      await CheckHelper.checkResponseType(userSignup);

      const getUserResponse = await dbStatus('getUser', {
        accessToken: adminAPIResponse.result['access_token'],
        userId: userSignup.result.id,
        URL
      });

      CheckHelper.checkResponseType(getUserResponse);

      const [response, err1] = await of(
        UserAPIs.signUp({
          invitationCode: secondInvitationCode,
          firstName: `user3a${TIMESTAMP}`,
          lastName: `user3a${TIMESTAMP}`,
          password: 'Test123',
          URL
        })
      );
      CheckHelper.checkError(response, err1);
    });

    it('User should be loggedin with correct credentials', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;

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
    });

    it('User should not be able to login if credentials are incorrect', async () => {
      const [loginAPIResponse, err] = await of(
        UserAPIs.login({
          username: 'incorrect@gmail.com',
          password: 'incorrect',
          URL
        })
      );
      CheckHelper.checkError(loginAPIResponse, err);
    });

    it('Logged in user should be able to view their details', async () => {
      let loggedInUsers = await UserAPIs.getAdminInfo({
        accessToken: adminAPIResponse.result['access_token'],
        URL
      });
      expect(loggedInUsers.metaData.message).toEqual(
        'User details have been successfully fetched.'
      );
    });

    it('User should be able to view the details of all the users', async () => {
      const allUsers = await UserAPIs.getOrgUsers({
        orgName: 'deqode',
        accessToken: adminAPIResponse.result['access_token'],
        URL
      });
      expect(allUsers.metaData.message).toEqual(
        'Users have been successfully fetched'
      );
    });

    it('User should not be able to view the details of all the users if organization name is invalid', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const userResponse = await UserAPIs.createUser({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });
      const [allUsers, err] = await of(
        UserAPIs.getOrgUsers({
          orgName: 'deqodee',
          accessToken: userResponse[0].result['access_token'],
          URL
        })
      );
      CheckHelper.checkError(allUsers, err);
    });

    it('Any User should be able to view the detail of users by user-id', async () => {
      const TIMESTAMP = timeStamp();
      inviteData.email = `userSession${TIMESTAMP}@gmail.com`;
      const userResponse = await UserAPIs.createUser({
        accessToken: adminAPIResponse.result['access_token'],
        invitationData: inviteData,
        URL,
        mailhogUrl: MAILHOG_URL
      });

      const loggedInUser = await UserAPIs.getAdminInfo({
        accessToken: userResponse[0].result['access_token'],
        URL
      });

      expect(loggedInUser.metaData.message).toEqual(
        'User details have been successfully fetched.'
      );
      CheckHelper.checkResponseType(userResponse[0]);
      CheckHelper.checkToken(userResponse[0]);
      await CheckHelper.checkMessage(
        'loginMsg',
        userResponse[0].metaData.message
      );

      const user = await UserAPIs.getUserDetails({
        accessToken: adminAPIResponse.result['access_token'],
        userId: loggedInUser.result.user['account_id'],
        URL
      });
      expect(user.metaData.message).toEqual(
        'User details have been successfully fetched'
      );
    });

    it('User should not be able to see the user details if userId is invaid', async () => {
      const [user, err] = await of(
        UserAPIs.getUserDetails({
          accessToken: adminAPIResponse.result['access_token'],
          userId: uuidv4(),
          URL
        })
      );
      CheckHelper.checkError(user, err);
    });
  });
});
