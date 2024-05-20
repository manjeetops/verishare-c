import crypto from 'crypto'
import of from 'await-of';
import moment from 'moment'
import CreateInvitation from './crud/createInvitation'
import GetUserByToken from '../user/getUserByToken'
import sendEmail from '../email'
import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import ActionBase from '../../utils/actionBase'
import config from '../../../config/app'
import responseHelper from '../../helpers/responseHelper'
import { log } from '../../utils/decorators/log'
import { BuildAndSendTransactionService } from '../blockchain';

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
  email: { type: 'email' },
  firstName: { type: 'string', optional: true },
  lastName: { type: 'string', optional: true }
}

@log
export default class InviteService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ keycloakToken, email, firstName, lastName }, ctx) {

    const user = await GetUserByToken.perform(keycloakToken, ctx)

    if (!user) {
      throw new Error(`User not valid`)
    }

    const invitationData = this.getInvitationData(user, email, firstName, lastName)

    // Create Invitation
    const invite = await CreateInvitation.perform(invitationData, ctx)

    const orgName = await this.getOrgName(user.orgId, user.blockchainId)

    const emailData = this.getEmailData({ email, firstName, lastName }, orgName, invitationData['invitationCode'])

    // Send Invitation
    await sendEmail.perform(emailData, ctx)

    return responseHelper({
      message: `Invitation has been successfully sent to the user ${email}`
    }, invite)
  }

  getInvitationData(user, email, firstName, lastName) {
    const invitationData = {
      email,
      orgId: user.orgId,
      invitationCode: crypto.randomBytes(32).toString('hex'),
      validTill: moment().add(2, 'days').toDate(),
      inviterAccountId: user.keycloakId,
      role: config.get('org_roles.employee')
    }
    if (firstName) {
      invitationData['firstName'] = firstName
    }
    if (lastName) {
      invitationData['lastName'] = lastName
    }
    return invitationData
  }

  getEmailData(user, orgName, invitationCode) {
    const url = config.get('keycloak.base_url')
    const { email, firstName } = user
    const str = firstName ? `${firstName},` : ','
    return {
      from: config.get('deqode.from_address'),
      to: email,
      subject: 'Join Invitation',
      text: '',
      html: `<p>Hi ${str}</p><p>You're invited to join the organization '${orgName}'. Please click the <a href='${url}/signup?code=${invitationCode}'>Joining Link</a></p>.`
    }
  }

  async getOrgName(orgId, userId){
    const payload = {
      action: 'get_organization'
    };

    const params = { orgId: orgId };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform({
        payload,
        uuid: userId,
        params
      })
    );

    if (error) {
      ctx.logger.error('Could not fetch oranization', error);
      throw new Error(error.message);
    }

    return response.uniqueName
  }
}
