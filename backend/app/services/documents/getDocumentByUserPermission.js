import of from 'await-of';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import { log } from '../../utils/decorators/log';
import responseHelper from '../../helpers/responseHelper';
import checkPaginationFields from '../../helpers/checkPaginationFields';
import { BuildAndSendTransactionService } from '../blockchain';

const schema = {
  user_id: { type: 'string', empty: false },
  page_offset: { type: 'string', optional: true, empty: false },
  page_number: { type: 'string', optional: true, empty: false }
};

@log
export default class GetDocumentsByUserPermissionService extends ActionBase {
  @argumentsValidator(schema)
  async perform(
    {
      user_id: userId,
      page_offset: pageOffset,
      page_number: pageNumber,
      user
    },
    ctx
  ) {
    ctx.logger.info(`Fetching documents of user ${userId}`);

    checkPaginationFields(pageOffset, pageNumber);
    pageOffset = parseInt(pageOffset) || 10;
    pageNumber = parseInt(pageNumber) || 1;

    const payload = {
      action: 'get_documents_by_user_permission'
    };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform(
        {
          payload,
          uuid: user.blockchainId,
          params: { userId: userId }
        },
        ctx
      )
    );

    if (error) {
      ctx.logger.error('Could not get the user documents', error);
      throw new Error(error.message);
    }

    //customize response
    this.customizeResponse(response.documents);

    return responseHelper(
      {
        message: 'Documents have been successfully fetched.',
        page_offset: pageOffset,
        page_number: pageNumber,
        total_page: Math.ceil(response.totalDocuments / pageOffset)
      },
      response.documents
    );
  }

  customizeResponse(documents) {
    documents.forEach(document => {
      document.documentId = document.id.id;
      delete document.id;
      delete document.participantsList;
      delete document.signers;
    });
  }
}
