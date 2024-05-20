import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import { log } from '../../utils/decorators/log';
import responseHelper from '../../helpers/responseHelper';
import { Account } from '../../../entity';
import { BuildAndSendTransactionService } from '../blockchain';
import of from 'await-of';
import { getRepository } from 'typeorm';
import { USER_TYPE_ENUM } from '../../helpers/constants';

const schema = {
  organization_id: { type: 'string' },
  status: { type: 'string' }
};

@log
export default class CreateOrganizationInBlockchainService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ organization_id: orgId, status }, ctx) {
    const payload = {
      action: 'update_org_status',
      options: {
        body: {
          status: status.toUpperCase()
        }
      }
    };

    //get admin of the organization
    const admin = await this.getAdmin();

    const [response, error] = await of(
      BuildAndSendTransactionService.perform({
        payload,
        uuid: admin.blockchainId,
        params: { orgId }
      })
    );

    if (error) {
      ctx.logger.error('Could not update organization status', error);
      throw new Error(error.message);
    }

    return responseHelper({
      message: `organization status has been successfully updated to ${status}`
    });
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
}
