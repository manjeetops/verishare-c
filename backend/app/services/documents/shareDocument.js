import _ from 'lodash';
import of from 'await-of';
import {
  DOCUMENT_ACCESS_SCOPE_ENUM,
  DOCUMENT_PERMISSIONS_ENUM
} from '../../helpers/constants';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';
import GetUser from '../user/getUser';

const schema = {
  document_id: { type: 'string', empty: false },
  receiverId: { type: 'string', empty: false },
  accessType: { type: 'string', empty: false },
  accessScope: { type: 'string', empty: false }
};

@log
export default class ShareDocumentService extends ActionBase {
  @argumentsValidator(schema)
  async perform(
    { document_id: documentId, receiverId, accessType, accessScope, user },
    ctx
  ) {
    //convert to upper case letters
    accessScope = accessScope.toUpperCase();
    accessType = accessType.toUpperCase();

    if (
      !DOCUMENT_ACCESS_SCOPE_ENUM.hasOwnProperty(accessScope) ||
      !DOCUMENT_PERMISSIONS_ENUM.hasOwnProperty(accessType)
    ) {
      throw new Error('Please check access type and access scope');
    }

    ctx.logger.info(`sharing document ${documentId} to user ${receiverId}`);

    const payload = {
      action: 'share_document',
      options: {
        body: {
          receiverId: receiverId,
          accessScope: DOCUMENT_ACCESS_SCOPE_ENUM[accessScope],
          accessType: DOCUMENT_PERMISSIONS_ENUM[accessType]
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
      ctx.logger.error('Could not share the document', error);
      throw new Error(error.message);
    }

    //customise the response
    response.documentId = response.id.id;
    delete response.id;
    delete response.participantsList;
    delete response.signers;

    return responseHelper(
      { message: `Document has been shared successfully.` },
      response
    );
  }
}
