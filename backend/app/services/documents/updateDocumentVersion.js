import archiver from 'archiver';
import _ from 'lodash';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';

const schema = {
  document: {
    type: 'object',
    props: {
      buffer: { type: 'object' },
      // encoding: "7bit"
      encoding: { type: 'string' },
      // mimetype: "image/png"
      mimetype: { type: 'string' },
      // originalname: "token.png"
      originalname: { type: 'string' },
      // size: 217081
      size: { type: 'number' }
    }
  },
  document_id: { type: 'string', empty: false }
};

@log
export default class UpdateDocumentVersionService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ document, document_id: documentId, user }, ctx) {
    ctx.logger.info(`Updating document ${documentId} version`);

    let documentData;

    var archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    if (document.mimetype == 'application/zip') {
      documentData = document.buffer;
    } else {
      archive.append(document.buffer, { name: document.originalname });
      archive.finalize();
      documentData = archive
    }

    const payload = {
      action: 'update_version',
      options: {
        formData: {
          document: {
            value: documentData,
            options: {
              contentType: document.mimetype,
              filename: document.originalname,
              knownLength: document.size
            }
          }
        }
      }
    };

    const response = await BuildAndSendTransactionService.perform(
      { payload, uuid: user.blockchainId, params: { documentId } },
      ctx
    );

    //customise the response
    response.documentId = response.id.id;
    delete response.id;
    delete response.participantsList;
    delete response.signers;

    return responseHelper(
      {
        message: `Document version has been successfully updated.`
      },
      response
    );
  }
}
