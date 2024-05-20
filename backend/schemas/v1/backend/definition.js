export const accessTokenRequest = {
  title: 'Access Token Schema',
  type: 'object',
  properties: {
    refresh_token: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'refresh_token'
  ],
  additionalProperties: false
}
export const loginServiceAccountRequest = {
  title: 'Login Service Account Schema',
  type: 'object',
  properties: {
    grant_type: {
      type: 'string',
      minLength: 1
    },
    client_id: {
      type: 'string',
      minLength: 1
    },
    client_secret: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'refresh_token',
    'client_id',
    'client_secret'
  ],
  additionalProperties: false
}
export const loginViaUsernameRequest = {
  title: 'Login Username PAssword Schema',
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1
    },
    password: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'username',
    'password'
  ],
  additionalProperties: false
}
export const logoutRequest = {
  title: 'Logout Schema',
  type: 'object',
  properties: {
    refresh_token: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'refresh_token',
  ],
  additionalProperties: false
}

export const createOrgInBlockchainRequest = {
  title: 'Create Organisation In Blockchain Schema',
  type: 'object',
  properties: {
    orgId: {
      type: 'string',
      minLength: 1
    },
    orgUniqueName: {
      type: 'string',
      minLength: 1
    },
    orgBusinessName: {
      type: 'string',
      minLength: 1
    },
    orgDescription: {
      type: 'string',
      minLength: 1
    },
    adminKeycloakId: {
      type: 'string',
      minLength: 1
    },
    serviceAccountKeycloakId: {
      type: 'string',
      minLength: 1
    },
    adminEmail: {
      type: 'string',
      minLength: 1
    },
    adminFirstName: {
      type: 'string',
      minLength: 1
    },
    adminLastName: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'orgId',
    'orgUniqueName',
    'orgBusinessName',
    'orgDescription',
    "adminKeycloakId",
    "serviceAccountKeycloakId",
    "adminEmail",
    "adminFirstName",
    "adminLastName"
  ],
  additionalProperties: false
}

export const updateOrganizationRequest = {
  title: 'Update Organization Schema',
  type: 'object',
  properties: {
    status: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'status'
  ],
  additionalProperties: false
}

export const inviteUserRequest = {
  title: 'Invite User Schema',
  type: 'object',
  properties: {
    email: {
      type: 'string',
      minLength: 1
    },
    firstName: {
      type: 'string',
      minLength: 1
    },
    lastName: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'email',
    'firstName',
    'lastName'
  ],
  additionalProperties: false
}
export const updateInvitationRequest = {
  title: 'Update Invitation Schema',
  type: 'object',
  properties: {
    validTill: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'validTill',
  ],
  additionalProperties: false
}
export const attestDocumentsRequest = {
  title: 'Attest Document Schema',
  type: 'object',
  properties: {
    version: {
      type: 'integer',
      minimum: 1
    }
  },
  required: [],
  additionalProperties: false
}
export const updateDocumentDetails = {
  title: 'Update Document Schema',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    },
    description: {
      type: 'string',
      minLength: 1
    },
    url: {
      type: 'string',
      minLength: 1
    }
  },
  additionalProperties: false
}
export const updateDocumentVersion = {
  title: 'Update Document version Schema',
  type: 'object',
  properties: {
    document: {
      description: 'File to be uploaded',
      type: 'string',
      format: 'binary'
    }
  },
  required: [
    'document',
  ],
  additionalProperties: false
}
export const transferOwnershipRequest = {
  title: 'Transfer Ownership Schema',
  type: 'object',
  properties: {
    userId: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'userId',
  ],
  additionalProperties: false
}
export const shareDocumentRequest = {
  title: 'Share Document Schema',
  type: 'object',
  properties: {
    receiverId: {
      type: 'string',
      minLength: 1
    },
    accessType: {
      type: 'string',
      minLength: 1
    },
    accessScope: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'receiverId',
    'accessType',
    'accessScope'
  ],
  additionalProperties: false
}
export const uploadDocumentRequest = {
  title: 'Upload Document Schema',
  type: 'object',
  properties: {
    document: {
      description: 'File to be uploaded',
      type: 'string',
      format: 'binary'
    },
    name: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    frozen: {
      type: 'string'
    }
  },
  required: [
    'document',
  ],
  additionalProperties: false
}
export const updateVersionRequest = {
  title: 'Upload Document Schema',
  type: 'object',
  properties: {
    document: {
      description: 'File to be uploaded',
      type: 'string',
      format: 'binary'
    }
  },
  required: [
    'document',
  ],
  additionalProperties: false
}

export const freezeDocument = {
  title: 'Freeze Document Schema',
  type: 'object',
  properties: {
    status: {
      type: 'boolean',
    }
  },
  required: [
    'status'
  ],
  additionalProperties: false
}

export const verifyDocumentSHARequest = {
  title: 'Verify Document SHA Schema',
  type: 'object',
  properties: {
    sha256: {
      type: 'string',
      minLength: 1
    },
    document: {
      description: 'File to be uploaded',
      type: 'string',
      format: 'binary'
    }
  },
  required: [
    'sha256',
    'document'
  ],
  additionalProperties: false
}
export const registerUserRequest = {
  title: 'Register User Request Schema',
  type: 'object',
  properties: {
    invitationCode: {
      type: 'string',
      minLength: 1
    },
    firstName: {
      type: 'string',
      minLength: 1
    },
    lastName: {
      type: 'string',
      minLength: 1
    },
    password: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'invitationCode',
    'firstName',
    'lastName',
    'password'
  ],
  additionalProperties: false
}

export const updateUserRequest = {
  title: 'Update User Request Schema',
  type: 'object',
  properties: {
    status: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'status'
  ],
  additionalProperties: false
}
