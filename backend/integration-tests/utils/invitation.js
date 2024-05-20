import { post, get, put, remove } from '../helpers/fetchHelper';
import moment from 'moment';

class InvitationAPIs {
  static async sendInvitation({ accessToken, invitationData, URL }) {
    const response = await post({
      accessToken,
      url: `${URL}/invites`,
      opts: {
        body: invitationData
      }
    });
    return response;
  }

  static async updateInvitation({ accessToken, invitationId, URL }) {
    let data = {
      validTill: moment()
        .add(2, 'days')
        .toDate()
    };
    const response = await put({
      accessToken,
      url: `${URL}/invites/${invitationId}`,
      opts: {
        body: data
      }
    });
    return response;
  }

  static async deleteInvitation({ accessToken, invitationId, URL }) {
    const response = await remove({
      accessToken,
      url: `${URL}/invites/${invitationId}`
    });
    return response;
  }

  static async getAllInvitation({ accessToken, URL }) {
    const response = await get({
      accessToken,
      url: `${URL}/invites`
    });
    return response;
  }

  static async getInvitation({ accessToken, invitationCode, URL }) {
    const response = await get({
      accessToken,
      url: `${URL}/invites/${invitationCode}`
    });
    return response;
  }

  static async getInvitationCode({ email, position, url }) {
    const response = await get({
      url,
    });
    const invitations = response;
    const userInvitations = invitations.items.filter(function(data) {
      return data.Raw.To[0] === email;
    });
    const body = userInvitations[position].Content.Body;
    const regexOne = /invites\/(.*)\=\s\n(.*)\'/g;
    const regexTwo = /[^\/ \r \n \= \']/g;
    let array;
    let invitationCode = '';
    const result1 = (body.match(regexOne))[0].substring(7);
    while ((array = regexTwo.exec(result1)) !== null) {
      invitationCode = invitationCode + array[0];
    }
    return invitationCode;
  }
}

export default InvitationAPIs;
