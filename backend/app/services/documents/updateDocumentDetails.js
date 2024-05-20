import of from 'await-of';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';

const schema = {
  document_id: { type: 'string', empty: false },
  name: { type: 'string', empty: false, optional: true },
  description: { type: 'string', empty: false, optional: true },
  url: { type: 'url', empty: false, optional: true }
};

@log
export default class UpdateDocumentDetailsService extends ActionBase {
  @argumentsValidator(schema)
  async perform(
    { document_id: documentId, user, name, description, url },
    ctx
  ) {
    ctx.logger.info(`Updating document ${documentId} details`);

    if (!name && !description && !url) {
      throw new Error(`Field 'name' or 'description' or 'url' is required`);
    }

    let newDocumentData = { name, description, url };
    // Blockchain
    const payload = {
      action: 'update_document_details',
      options: {
        body: {
          ...newDocumentData
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
      ctx.logger.error('Could not update the document details', error);
      throw new Error(error.message);
    }

    //customise the response
    response.documentId = response.id.id;
    delete response.id;
    delete response.participantsList;
    delete response.signers;

    return responseHelper(
      {
        message: 'Document has been successfully updated'
      },
      response
    );
  }
}
