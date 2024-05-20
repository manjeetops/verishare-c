import nodemailer from 'nodemailer'
import config from '../config/app'

const { username: user, password: pass, host, port, secure } = config.get('email')

const getEmailTransport = () => {
  const mailTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  })
  return mailTransporter
}

export default getEmailTransport
