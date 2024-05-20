import getEmailTransporter from '../../server/email'

const transporter = getEmailTransporter()

const sendEmail = (mailOptions, ctx) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

export default sendEmail
