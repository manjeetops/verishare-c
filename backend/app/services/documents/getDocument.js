import of from 'await-of';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import responseHelper from '../../helpers/responseHelper';
import ActionBase from '../../utils/actionBase';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';

const schema = {
  document_id: { type: 'string', optional: true, empty: false }
};

@log
export default class GetDocumentService extends ActionBase {
  @argumentsValidator(schema)
  async perform(
    { user, document_id: documentId },
    ctx
  ) {
    const payload = {
      action: 'get_document'
    };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform(
        { payload, uuid: user.blockchainId, params: { documentId } },
        ctx
      )
    );

    if (error) {
      ctx.logger.error('Could not get the document', error);
      throw new Error(error.message);
    }

    response.id = response.documentId
    delete response['documentId']
    
    return responseHelper(
      {
        message: 'Document details have been successfully fetched'
      },
      response
    );
  }
}
