import { Invitation } from '../../../../entity/invitation';
import { argumentsValidator } from '../../../utils/decorators/argumentsValidator';
import ActionBase from '../../../utils/actionBase';
import { getRepository } from 'typeorm';
import {
  nonEmptyString,
  email,
  date
} from '../../../helpers/validationConstraints';
import of from 'await-of';
import { log } from '../../../utils/decorators/log';

const schema = {
  email,
  invitationCode: nonEmptyString,
  orgId: nonEmptyString,
  validTill: date,
  inviterAccountId: nonEmptyString,
  role: nonEmptyString,
  firstName: { type: 'string', optional: true },
  lirstName: { type: 'string', optional: true }
};

@log
export default class CreateInvitationService extends ActionBase {
  @argumentsValidator(schema)
  async perform(
    {
      email,
      invitationCode,
      validTill,
      orgId,
      inviterAccountId,
      role,
      firstName,
      lastName
    },
    ctx
  ) {
    const InvitationRepositary = await getRepository(Invitation);
    const invitation = new Invitation();

    invitation.email = email;
    invitation.invitationCode = invitationCode;
    invitation.validTill = validTill;
    invitation.orgId = orgId;
    invitation.inviterAccountId = inviterAccountId;
    invitation.role = role;
    if (firstName) {
      invitation.firstName = firstName;
    }

    if (lastName) {
      invitation.lastName = lastName;
    }
    invitation.status = 'active';
    invitation['joined'] = false;

    const [result, err] = await of(InvitationRepositary.save(invitation));

    if (err) {
      ctx.logger.error('create Invitation Failed', err);
      throw new Error('create Invitation Failed');
    }

    return { invitation_id: result.id };
  }
}
