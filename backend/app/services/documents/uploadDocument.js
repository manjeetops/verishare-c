import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';
import GetUser from '../user/getUser';
import archiver from 'archiver';

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
  name: { type: 'string' },
  description: { type: 'string' },
  url: { type: 'url' },
  user_id: { type: 'string' },
  frozen: { type: 'enum', values: ['true', 'false'], optional: true }
};

@log
export default class uploadDocumentService extends ActionBase {
  @argumentsValidator(schema)
  async perform(
    { document, name, description, url, user_id: userId, user, frozen, admin },
    ctx
  ) {
    ctx.logger.info('Uploading document', {
      name,
      description,
      url,
      userId,
      frozen
    });

    if (admin !== true && frozen.toLowerCase() === 'true') {
      throw new Error('User not allowed to freeze the document');
    }

    const owner = await GetUser.perform({
      blockchainId: userId
    });

    if (!owner) {
      throw new Error(`User ${userId} not found`);
    }

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
      action: 'add_document',
      options: {
        formData: {
          document: {
            value: documentData,
            options: {
              contentType: document.mimetype,
              filename: document.originalname,
              knownLength: document.size
            }
          },
          ownerId: owner.blockchainId,
          name: name,
          description: description,
          url: url,
          frozen: frozen.toLowerCase()
        }
      }
    };

    const response = await BuildAndSendTransactionService.perform(
      { payload, uuid: user.blockchainId },
      ctx
    );

    //customise the response
    response.documentId = response.id.id;
    delete response.id;
    delete response.participantsList;
    delete response.signers;

    return responseHelper(
      { message: `Document has been successfully uploaded` },
      response
    );
  }
}
