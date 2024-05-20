import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';
import GetUser from '../user/getUser';
import of from 'await-of';

const schema = {
  document_id: { type: 'string', empty: false },
  keycloakSubId: { type: 'string', empty: false }
};

@log
export default class GetDocumentAttestationsService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ document_id: documentId, keycloakSubId }, ctx) {
    ctx.logger.info(
      `Getting attestations of document ${documentId} for user ${keycloakSubId}`
    );

    const user = await GetUser.perform({ keycloakId: keycloakSubId }, ctx);

    if (!user) {
      throw new Error(`Invalid user`);
    }

    const payload = {
      action: 'get_document_attestations'
    };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform(
        { payload, uuid: user.blockchainId, params: { documentId } },
        ctx
      )
    );

    if (error) {
      ctx.logger.error('Could not get document attestations', error);
      throw new Error(error.message);
    }

    //customise response
    delete response.parties
    // this.customiseResponse(response)

    return responseHelper(
      {
        message: 'Document attestations have been successfully fetched'
      },
      response
    );
  }

  customiseResponse(response) {
    delete response.parties
    response.attestations.forEach(attestation => {
      attestation.userId = attestation.first
      attestation.version = attestation.second
      delete attestation.first
      delete attestation.second
    })
  }
}
