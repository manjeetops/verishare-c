import ActionBase from '../../../utils/actionBase';
import { log } from '../../../utils/decorators/log';
import { endPoints } from '../../../helpers/blockchainEndPoints';
import rp from 'request-promise';
import of from 'await-of';
import config from '../../../../config/app';

const { base_url } = config.get('blockchain');

@log
export default class BuildAndSendTransactionService extends ActionBase {
  async perform({ payload, uuid, params }, ctx) {
    // generates transaction and send it to Corda Blockchain
    const { method, endpoint } = endPoints({
      ...params,
      action: payload.action
    });

    const headers = this.getHeader(uuid);
    const url = base_url + endpoint;

    return this.requestWrapper(headers, url, method, payload.options, {
      action: payload.action
    });
  }

  getHeader(uuid) {
    let headers = {};

    if (uuid) {
      headers['username'] = uuid;
    }
    return headers;
  }

  async requestWrapper(headers, url, method, opts, { action }) {
    const options = {
      method,
      headers,
      json: true,
      uri: url,
      followRedirect: false,
      withCredentials: true,
      ...opts
    };

    if (action == 'download_document') {
      options['resolveWithFullResponse'] = true;
      options['encoding'] = null;
    }

    const [response, err] = await of(rp(options));
    if (err) {
      throw new Error(err);
    }
    return response;
  }
}
