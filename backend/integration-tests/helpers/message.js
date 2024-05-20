class MessageHelper {
  static createOrganizationMsg (orgName) {
    return `organization '${orgName}' has been successfully created`
  }
  static loginMsg () {
    return `You have successfully loggedIn.`
  }
  static inviteMsg (email) {
    return `Invitation has been successfully sent to the user ${email}`
  }
  static signUpMsg(email) {
    return `User \'${email}\' has been successfully created`
  }
  static logoutMsg(email) {
    return `User has been successfully logged out`
  }
  static attestMsg() {
    return `Document has been successfully attested`
  }
  static uploadDocumentMsg() {
    return `Document has been successfully uploaded`
  }
}

export default MessageHelper
