import of from 'await-of';
import _ from 'lodash';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import responseHelper from '../../helpers/responseHelper';
import ActionBase from '../../utils/actionBase';
import checkPaginationFields from '../../helpers/checkPaginationFields';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';

const schema = {
  document_id: { type: 'string', empty: false },
  page_offset: { type: 'string', optional: true, empty: false },
  page_number: { type: 'string', optional: true, empty: false }
};

@log
export default class GetDocumentOwnerShipHistoryService extends ActionBase {
  @argumentsValidator(schema)
  async perform(
    {
      document_id: documentId,
      user,
      page_offset: pageOffset,
      page_number: pageNumber
    },
    ctx
  ) {
    ctx.logger.info(`Fetching ownership history of document ${documentId}`);

    checkPaginationFields(pageOffset, pageNumber);
    pageOffset = parseInt(pageOffset) || 10;
    pageNumber = parseInt(pageNumber) || 1;
    const skip = (pageNumber - 1) * pageOffset;

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
      ctx.logger.error('Could not fetch ownershipHistory of document', error);
      throw new Error(error.message);
    }

    const ownershipHistory = [];
    const upperLimit =
      response.ownershipHistory.length > skip + pageOffset
        ? skip + pageOffset
        : response.ownershipHistory.length;

    for (let count = skip; count < upperLimit; count++) {
      ownershipHistory.push(response.ownershipHistory[count]);
    }

    return responseHelper(
      {
        message: 'Ownership history has been successfully fetched.',
        page_offset: pageOffset,
        page_number: pageNumber,
        total_page: Math.ceil(response.ownershipHistory.length / pageOffset)
      },
      { documentId: response.documentId.id, ownershipHistory }
    );
  }
}
