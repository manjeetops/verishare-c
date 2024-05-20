import of from 'await-of';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import { log } from '../../utils/decorators/log';
import responseHelper from '../../helpers/responseHelper';
import checkPaginationFields from '../../helpers/checkPaginationFields';
import GetUser from '../user/getUser';
import { BuildAndSendTransactionService } from '../blockchain';

const schema = {
  page_offset: { type: 'string', optional: true, empty: false },
  page_number: { type: 'string', optional: true, empty: false },
  organization_id: { type: 'string' },
  keycloakSubId: { type: 'string' }
};

@log
export default class GetAllDocumentsService extends ActionBase {
  @argumentsValidator(schema)
  async perform(
    {
      page_offset: pageOffset,
      page_number: pageNumber,
      organization_id: organizationId,
      keycloakSubId
    },
    ctx
  ) {
    ctx.logger.info('Fetching documents of organization');
    // check pagination
    checkPaginationFields(pageOffset, pageNumber);
    pageOffset = parseInt(pageOffset) || 10;
    pageNumber = parseInt(pageNumber) || 1;

    // Get user
    const user = await GetUser.perform({ keycloakId: keycloakSubId }, ctx);

    if (!user) {
      ctx.logger.error('Invalid user');
      throw new Error('Invalid user');
    }

    const payload = {
      action: 'get_organization_documents'
    };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform(
        {
          payload,
          uuid: user.blockchainId,
          params: { orgId: organizationId }
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
