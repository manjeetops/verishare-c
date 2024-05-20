import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import of from 'await-of';
import { log } from '../../utils/decorators/log';
import responseHelper from '../../helpers/responseHelper';
import { BuildAndSendTransactionService } from '../blockchain';

const schema = {
  document_id: { type: 'string' }
};

@log
export default class DeleteDocumentService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ document_id: documentId, user }, ctx) {
    ctx.logger.info(`Deleting document ${documentId}`);

    const payload = {
      action: 'delete_document'
    };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform(
        { payload, uuid: user.blockchainId, params: { documentId } },
        ctx
      )
    );

    if (error) {
      ctx.logger.error('Could not delete the document', error);
      throw new Error(error.message);
    }

    //customise the response
    response.documentId = response.id.id;
    delete response.id;
    delete response.participantsList;
    delete response.signers;

    return responseHelper(
      {
        message: 'Document has been deleted successfully'
      },
      response
    );
  }
}
