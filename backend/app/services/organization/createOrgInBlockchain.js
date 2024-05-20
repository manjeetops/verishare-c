import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import { log } from '../../utils/decorators/log';
import responseHelper from '../../helpers/responseHelper';
import { Account } from '../../../entity';
import { BuildAndSendTransactionService } from '../blockchain';
import of from 'await-of';
import { getManager } from 'typeorm';

const schema = {
  orgUniqueName: { type: 'string' },
  orgBusinessName: { type: 'string' },
  orgDescription: { type: 'string' },
  adminEmail: { type: 'string' },
  adminFirstName: { type: 'string' },
  adminLastName: { type: 'string' },
  adminKeycloakId: { type: 'string' },
  serviceAccountKeycloakId: { type: 'string' }
};

@log
export default class CreateOrganizationInBlockchainService extends ActionBase {
  @argumentsValidator(schema)
  async perform(reqData, ctx) {
    const {
      orgId,
      orgUniqueName,
      orgBusinessName,
      orgDescription,
      adminEmail,
      adminFirstName,
      adminLastName,
      adminKeycloakId,
      serviceAccountKeycloakId
    } = reqData;

    const payload = {
      action: 'create_organization',
      options: {
        body: {
          orgId: orgId,
          orgUniqueName: orgUniqueName,
          businessName: orgBusinessName,
          description: orgDescription,
          adminEmail: adminEmail,
          adminFirstName: adminFirstName,
          adminLastName: adminLastName
        }
      }
    };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform({ payload })
    );

    if (error) {
      ctx.logger.error('Could not create organization', error);
      throw new Error(error.message);
    }

    //create admin in db
    const adminAccount = this.createUserInDb(
      adminKeycloakId,
      response.adminAccountInfo.id,
      response.adminAccountInfo.email,
      response.organizationInfoState.identifier.id,
      response.adminAccountInfo.role,
    );

    //create service account in db
    const serviceAccount = this.createUserInDb(
      serviceAccountKeycloakId,
      response.serviceAccountInfo.id,
      response.serviceAccountInfo.email,
      response.organizationInfoState.identifier.id,
      response.serviceAccountInfo.role,
    );

    const [res, err] = await of(
      this.saveUsersInDb(adminAccount, serviceAccount)
    );

    if (err) {
      ctx.logger.error('Could not save accounts', err);
      throw new Error(err.message);
    }

    //customize response
    this.customiseResponse(response, adminKeycloakId, serviceAccountKeycloakId)

    return responseHelper(
      {
        message: `organization '${orgUniqueName}' has been successfully created in blockchain`
      },
      response
    );
  }

  createUserInDb(keycloakId, blockchainId, email, orgId, role) {
    const account = new Account();
    account.keycloakId = keycloakId;
    account.blockchainId = blockchainId;
    account.email = email
    account.orgId = orgId
    account.role = role
    return account;
  }

  async saveUsersInDb(adminAccount, serviceAccount) {
    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save(adminAccount);
      await transactionalEntityManager.save(serviceAccount);
    });
  }

  customiseResponse(response, adminKeycloakId, serviceAccountKeycloakId){
    //organization
    response.organizationInfoState.id = response.organizationInfoState.identifier.id
    delete response.organizationInfoState.identifier
    delete response.organizationInfoState.host
    delete response.organizationInfoState.parties

    //admin
    response.adminAccountInfo.keycloakId = adminKeycloakId,
    delete response.adminAccountInfo.parties
    delete response.adminAccountInfo.adminPublicKey

    //service account
    response.serviceAccountInfo.keycloakId = serviceAccountKeycloakId
    delete response.serviceAccountInfo.parties
    delete response.serviceAccountInfo.adminPublicKey
  }
}
