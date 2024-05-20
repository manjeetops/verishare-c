import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import crypto from 'crypto'

const schema = {
  sha256: { type: 'string', empty: false },
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
  }
};

@log
export default class VerifySHA256 extends ActionBase {
  @argumentsValidator(schema)
  async perform({ document, sha256 }) {
    const algorithm = 'sha256';
    var shasum = crypto.createHash(algorithm);
    shasum.update(document.buffer)
    const documentHash = shasum.digest('hex').toUpperCase();
    if (sha256 !== documentHash) {
      throw new Error('document hash does not match');
    }
    return responseHelper({
      message: `SHA256 hash has been successfully verified.`
    });
  }
}
