import of from 'await-of';
import CreateUserOnKeycloak from './keycloak/createUser';
import GetKeycloakAdminClient from '../keycloak/admin/GetKeycloakAdminClient';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import GetInvitation from '../invites/crud/getInvitation';
import UpdateInvitation from '../invites/crud/updateInvitation';
import CheckInvitation from '../invites/checkInvitation';
import { getRepository } from 'typeorm';
import { Account } from '../../../entity';
import { USER_TYPE_ENUM } from '../../helpers/constants';
import { BuildAndSendTransactionService } from '../blockchain';
import config from '../../../config/app'

const schema = {
  invitationCode: { type: 'string' },
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  password: { type: 'string' }
};

const keycloakConfig = config.get('keycloak')

@log
export default class SignupService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ invitationCode, firstName, lastName, password }, ctx) {

    const invitation = await GetInvitation.perform(
      { invitationCode },
      ctx
    );

    if(invitation.joined){
      ctx.logger.error('User already joined the organization')
      throw new Error('User already joined the organization')
    }

    //  check if invitation expired or not
    await CheckInvitation.perform({ validTill: invitation.valid_till }, ctx);

    const newUserData = {
      firstName,
      lastName,
      email: invitation.email,
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false
        }
      ]
    };

    //get admin of the organization
    const admin = await this.getAdmin();
    // get keycloak admin client
    const keycloakAdminClient = await GetKeycloakAdminClient.perform({}, ctx);

    // get roles from keycloak
    let role = await this.getRoleFromKeycloak(keycloakAdminClient, ctx);

    // create user on keycloak
    const keycloakSubjectId = await CreateUserOnKeycloak.perform(
      {
        keycloakAdminClient,
        userData: newUserData
      },

      ctx
    );

    // set role
    await this.setRoleOfUser(keycloakAdminClient, keycloakSubjectId, role, ctx);

    const payload = {
      action: 'add_account',
      options: {
        body: {
          email: invitation.email,
          firstName: firstName,
          lastName: lastName
        }
      }
    };

    //send the transaction to corda
    const [response, error] = await of(
      BuildAndSendTransactionService.perform({
        payload,
        uuid: admin.blockchainId
      })
    );

    if (error) {
      ctx.logger.error('Could not create user', error);
      throw new Error(error.message);
    }

    //update invitation
    await UpdateInvitation.perform(
      { invitation_id: invitation['id'], joined: true },
      ctx
    );

    //save user in database
    const [res, err] = await of(
      this.saveUserInDb(
        keycloakSubjectId,
        response.id,
        response.email,
        response.organizationId,
        response.role
      )
    );

    if (err) {
      ctx.logger.error('could not save user in database', err);
      throw new Error(err.message);
    }

    //customize response
    delete response.parties
    delete response.adminPublicKey

    return responseHelper(
      {
        message: `User '${invitation.email}' has been successfully created`
      },
      response
    );
  }

  async getRoleFromKeycloak(keycloakAdminClient, ctx) {
    const keycloakRoleMethod = keycloakAdminClient.realms.roles;
    const [roleData, err] = await of(
      keycloakRoleMethod.find(keycloakConfig['realm_name'], 'org-employee')
    );
    if (err) {
      ctx.logger.error('Failed to fetch the role info from keycloak', err);
      throw new Error('Failed to fetch the role info from keycloak');
    }
    return roleData;
  }

  async setRoleOfUser(KeycloakAdminClient, userKeycloakSubjectId, role, ctx) {
    const roleMethod = KeycloakAdminClient.realms.maps;
    const [response, err] = await of(
      roleMethod.map(keycloakConfig['realm_name'], userKeycloakSubjectId, [role])
    );
    if (err) {
      ctx.logger.error('error mapUserRoleOnKeycloak', err);
      throw new Error('Error while mapping role to keycloak user');
    }
    return response;
  }

  async getAdmin() {
    const AccountRepositary = await getRepository(Account);
    const [result, err] = await of(
      AccountRepositary.findOne({ role: USER_TYPE_ENUM.ADMIN_ACCOUNT })
    );

    if (err) {
      ctx.logger.error('could not get user account', err);
      throw new Error(err.message);
    }

    if (!result) {
      ctx.logger.error('could not get user account', err);
      throw new Error('Admin not found for this organization');
    }

    return result;
  }

  async saveUserInDb(keycloakId, blockchainId, email, orgId, role) {
    const AccountRepositary = await getRepository(Account);

    const account = new Account();
    account.keycloakId = keycloakId;
    account.blockchainId = blockchainId;
    account.email = email;
    account.orgId = orgId;
    account.role = role;

    const result = await AccountRepositary.save(account);
    return result;
  }
}
