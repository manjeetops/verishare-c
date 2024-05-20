import _ from 'lodash';
import of from 'await-of';
import ActionBase from '../../utils/actionBase';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';
import checkPaginationFields from '../../helpers/checkPaginationFields';
import GetUserByToken from '../user/getUserByToken';

const schema = {
  keycloakToken: {
    type: 'object',
    props: {
      content: {
        type: 'object',
        props: {
          sub: { type: 'string' }
        }
      }
    }
  },
  page_number: { type: 'string', optional: true },
  page_offset: { type: 'string', optional: true }
};

@log
export default class GetOrgListService extends ActionBase {
  @argumentsValidator(schema)
  async perform(
    { page_number: pageNumber, page_offset: pageOffset, keycloakToken },
    ctx
  ) {
    //get user by accessToken
    const user = await GetUserByToken.perform(keycloakToken, ctx);

    checkPaginationFields(pageOffset, pageNumber);
    pageOffset = parseInt(pageOffset) || 10;
    pageNumber = parseInt(pageNumber) || 1;

    // get organizations
    const payload = {
      action: 'get_all_organizations',
      options: {
        //query parameters
        qs: {
          page_offset: pageOffset,
          page_number: pageNumber
        }
      }
    };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform({
        payload,
        uuid: user.blockchainId
      })
    );

    if (error) {
      ctx.logger.error('Could not fetch oranizations', error);
      throw new Error(error.message);
    }

    //customize response
    this.customizeResponse(response.organizations);

    return responseHelper(
      {
        message: `Organizations have been successfully fetched`,
        page_offset: pageOffset,
        page_number: pageNumber,
        total_page: Math.ceil(response.totalOrganizations / pageOffset)
      },
      response.organizations
    );
  }

  customizeResponse(organizations) {
    organizations.forEach(organization => {
      organization.id = organization.identifier.id;
      delete organization.identifier;
      delete organization.host;
      delete organization.parties;
    });
  }
}
