import _ from 'lodash';
import of from 'await-of';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';
import GetUser from '../user/getUser';

const schema = {
  document_id: { type: 'string', empty: false },
  newOwnerId: { type: 'string', empty: false }
};

@log
export default class TransferDocumentOwnershipService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ document_id: documentId, newOwnerId, user }, ctx) {

    ctx.logger.info(`Transfering document ${documentId} to user ${newOwnerId}`);

    const payload = {
      action: 'transfer_document',
      options: {
        body: {
          newOwnerId: newOwnerId
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
      ctx.logger.error('Could not transfer the document', error);
      throw new Error(error.message);
    }

    //customise the response
    response.documentId = response.id.id;
    delete response.id;
    delete response.participantsList;
    delete response.signers;

    return responseHelper(
      { message: `Document ownership has been transferred successfully.` },
      response
    );
  }
}
