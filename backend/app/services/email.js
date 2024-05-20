import sendMail from '../helpers/emailTransporter'
import { argumentsValidator } from '../utils/decorators/argumentsValidator'
import ActionBase from '../utils/actionBase'
import of from 'await-of'

const schema = {
  to: { type: 'string' },
  from: { type: 'string' },
  subject: { type: 'string' },
  text: { type: 'string' },
  html: { type: 'string' }
}

export default class EmailService extends ActionBase {
  @argumentsValidator(schema)
  async perform ({ to, from, subject, text, html }, ctx) {
    const [response, err] = await of(sendMail({ to, from, subject, text, html }, ctx))
    if (err) {
      ctx.logger.error('Send email failed', err)
      throw new Error('Send email failed')
    }
    return response
  }
}
