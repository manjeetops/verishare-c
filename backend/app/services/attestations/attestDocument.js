import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';
import GetUser from '../user/getUser';
import of from 'await-of';

const schema = {
  document_id: { type: 'string', empty: false },
  version: { type: 'number', empty: false },
  keycloakSubId: { type: 'string', empty: false }
};

@log
export default class AttestDocumentService extends ActionBase {
  @argumentsValidator(schema)
  async perform(
    { document_id: documentId, version, keycloakSubId },
    ctx
  ) {
    ctx.logger.info(`Attesting document ${documentId} by user ${keycloakSubId}`);

    const user = await GetUser.perform({ keycloakId: keycloakSubId }, ctx);

    if (!user) {
      throw new Error(`Invalid user`);
    }

    const payload = {
      action: 'attest_document',
      options: {
        body: {
          version
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
      ctx.logger.error('Could not attest the document', error);
      throw new Error(error.message);
    }

    return responseHelper({
      message: 'Document has been successfully attested'
    });
  }
}
