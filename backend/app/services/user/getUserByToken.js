import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import { getRepository } from 'typeorm';
import { Account } from '../../../entity';
import ActionBase from '../../utils/actionBase';

const schema = {
  content: {
    type: 'object',
    props: {
      sub: { type: 'string' }
    }
  }
};

export default class GetUserByTokenService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ content }, ctx) {
    const { sub: keycloakSubjectId } = content;

    const AccountRepositary = await getRepository(Account);
    const user = await AccountRepositary.findOne({
      keycloakId: keycloakSubjectId
    });

    return user;
  }
}
