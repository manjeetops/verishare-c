import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import of from 'await-of';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';
import GetUser from '../user/getUser';

const schema = {
  status: { type: 'boolean', empty: false },
  document_id: { type: 'string' },
  keycloakSubId: { type: 'string' }
};

@log
export default class FreezeDocumentService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ status, document_id: documentId, keycloakSubId }, ctx) {
    ctx.logger.info(`Freezing document ${documentId}`);

    const user = await GetUser.perform({ keycloakId: keycloakSubId }, ctx);

    if (!user) {
      throw new Error(`User not valid`);
    }

    const payload = {
      action: 'freeze_document',
      options: {
        body: {
          frozen: status
        }
      }
    };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform(
        { payload, uuid: user.blockchainId, params: { documentId } },
        ctx
      )
    );

    if (error) {
      ctx.logger.error('Could not freeze the document', error);
      throw new Error(error.message);
    }

    return responseHelper({
      message: `Document frozen status has been updated successfully to ${status}`
    });
  }
}
