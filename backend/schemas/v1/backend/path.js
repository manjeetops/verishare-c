export default {
  '/api/v1/swagger': {
    get: {
      tags: ['Swagger'],
      summary: 'Swagger UI',
      responses: {
        '201': {
          description: 'Swagger UI generated'
        }
      }
    }
  },

  '/api/v1/organizations': {
    // Done
    post: {
      tags: ['Organization'],
      summary:
        'To create a new organization in blockchain. (Requires basic authentication(super admin) scheme and done after org registered in keycloak)',
      parameters: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/createOrgInBlockchainRequest'
            }
          }
        },
        description: 'Parameters to create organisation in blockchain',
        required: true
      },
      responses: {
        '200': {
          description:
            'Organisation has been created successfully in blockchain'
        }
      }
    },
    get: {
      tags: ['Organization'],
      summary: 'Api to get the organizations list.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },
        {
          name: 'page_offset',
          in: 'query',
          description: 'Page offset',
          required: true,
          schema: {
            type: 'integer'
          }
        },
        {
          name: 'page_number',
          in: 'query',
          description: 'Page Number',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Organizations have been successfully fetched'
        }
      }
    }
  },

  '/api/v1/organizations/{organization_id}': {
    get: {
      tags: ['Organization'],
      summary: 'Api to get the organization info.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },
        {
          name: 'organization_id',
          in: 'path',
          description: 'Id of the organisation user is related to',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Organization info has been successfully fetched'
        }
      }
    }
  },

  '/api/v1/organizations/{organization_id}/update-status': {
    put: {
      tags: ['Organization'],
      summary:
        'Api to update the organization status (Requires basic authentication of super admin).',
      parameters: [
        {
          name: 'organization_id',
          in: 'path',
          description: 'Id of the organisation',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/updateOrganizationRequest'
            }
          }
        },
        description: 'Parameters to update organisation status',
        required: true
      },
      responses: {
        '200': {
          description: 'Organization status has been successfully updated'
        }
      }
    }
  },

  '/api/v1/organizations/{organization_id}/users': {
    // Done
    get: {
      tags: ['Organization'],
      summary: 'Api to get list of all users in the organization.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },
        {
          name: 'organization_id',
          in: 'path',
          description: 'Id of the organisation user is related to',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'page_offset',
          in: 'query',
          description: 'Page offset',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1
          }
        },
        {
          name: 'page_number',
          in: 'query',
          description: 'Page number',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100
          }
        }
      ],
      responses: {
        '200': {
          description: 'Users have been successfully fetched'
        }
      }
    }
  },

  '/api/v1/organizations/{organization_id}/documents': {
    get: {
      tags: ['Organization'],
      summary: 'APi to get documents list of all users of an organization.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },
        {
          name: 'organization_id',
          in: 'path',
          description: 'Organization ID',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'page_offset',
          in: 'query',
          description: 'Page offset',
          required: true,
          schema: {
            type: 'integer'
          }
        },
        {
          name: 'page_number',
          in: 'query',
          description: 'Page Number',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Documents have been successfully fetched.'
        }
      }
    }
  },

  '/api/v1/user-info': {
    // Done
    get: {
      tags: ['Users'],
      summary: 'API to get the user details of an organisation',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'Returns user info'
        }
      }
    }
  },

  '/api/v1/protocol/openid-connect/token': {
    // Done
    post: {
      tags: ['Users'],
      summary: 'API to get the new access token using refresh token',
      parameters: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/accessTokenRequest'
            }
          }
        },
        description: 'Parameters to generate access token',
        required: true
      },
      responses: {
        '200': {
          description: 'Access token has been generated'
        }
      }
    }
  },

  '/auth/realms/{realm_name}/protocol/openid-connect/token': {
    // Done
    post: {
      tags: ['Users'],
      summary: 'API to login into service acccount',
      parameters: [
        {
          name: 'realm_name',
          in: 'path',
          description: 'realm name',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'application/x-www-form-urlencoded': {
            schema: {
              $ref: '#/components/schemas/loginServiceAccountRequest'
            }
          }
        },
        description: 'Parameters to generate access token',
        required: true
      },
      responses: {
        '200': {
          description: 'Access token has been generated'
        }
      }
    }
  },

  '/api/v1/protocol/openid-connect/login': {
    // Done
    post: {
      tags: ['Users'],
      summary: 'API to login into account',
      parameters: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/loginViaUsernameRequest'
            }
          }
        },
        description: 'Parameters to login',
        required: true
      },
      responses: {
        '200': {
          description: 'You have successfully loggedIn'
        }
      }
    }
  },

  '/api/v1/protocol/openid-connect/logout': {
    // Done
    post: {
      tags: ['Users'],
      summary: 'API to logout the user.',
      parameters: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/logoutRequest'
            }
          }
        },
        description: 'Parameters to logout from account',
        required: true
      },
      responses: {
        '200': {
          description: 'User has been successfully logged out'
        }
      }
    }
  },

  '/api/v1/users/{user_id}': {
    // Done
    get: {
      tags: ['Users'],
      summary: 'Api to get the user details',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'Id of a user',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User details have been successfully fetched'
        }
      }
    }
  },

  '/api/v1/users/{user_id}/update-status': {
    put: {
      tags: ['Users'],
      summary: 'Api to update the user status.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'Id of a user',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],

      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/updateUserRequest'
            }
          }
        },
        description: 'Parameters to create invites',
        required: true
      },

      responses: {
        '200': {
          description: 'User status has been successfully updated'
        }
      }
    }
  },

  '/api/v1/users': {
    // Done
    get: {
      tags: ['Users'],
      summary: 'Api to get list of all users.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },
        {
          name: 'page_offset',
          in: 'query',
          description: 'Page offset',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1
          }
        },
        {
          name: 'page_number',
          in: 'query',
          description: 'Page number',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100
          }
        }
      ],
      responses: {
        '200': {
          description: 'Users have been successfully fetched'
        }
      }
    }
  },

  '/api/v1/invites': {
    // Done
    get: {
      tags: ['Invites'],
      summary: 'API to get list of all invitations.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'Invitations details has been successfully fetched.'
        }
      }
    },

    post: {
      tags: ['Invites'],
      summary: 'API for inviting the user.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/inviteUserRequest'
            }
          }
        },
        description: 'Parameters to create invites',
        required: true
      },
      responses: {
        '200': {
          description: 'Invitation has been successfully sent to the user'
        }
      }
    }
  },

  '/api/v1/invites/{invitation_id}': {
    // Done
    delete: {
      tags: ['Invites'],
      summary: 'Delete an invitation using the invitation id.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'invitation_id',
          in: 'path',
          description: 'Invitation Id',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Invitation has been successfully deleted'
        }
      }
    },

    put: {
      tags: ['Invites'],
      summary: 'Update an invitation using the invitation id.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'invitation_id',
          in: 'path',
          description: 'Invitation Id',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/updateInvitationRequest'
            }
          }
        },
        description: 'Parameters to update invitation',
        required: true
      },
      responses: {
        '200': {
          description: 'Invitation has been successfully Updated'
        }
      }
    }
  },

  '/api/v1/invites/{invitation_code}': {
    // Done
    get: {
      tags: ['Invites'],
      summary:
        'This Api will be called when user clicks on the link which he gets through the invitation mail.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'invitation_code',
          in: 'path',
          description: 'Code of Invitation',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Invitation details has been successfully fetched'
        }
      }
    }
  },

  '/api/v1/documents/{document_id}/attestations': {
    // Done
    post: {
      tags: ['Attestations'],
      summary: 'API to attest a document using document id.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'document_id',
          in: 'path',
          description: 'Document ID',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/attestDocumentsRequest'
            }
          }
        },
        description: 'Parameters to attest document',
        required: true
      },
      responses: {
        '200': {
          description: 'Document has been successfully attested'
        }
      }
    },

    get: {
      tags: ['Attestations'],
      summary: 'Api to get the attestations of a document.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'document_id',
          in: 'path',
          description: 'Document ID',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Attestations have been successfully fetched'
        }
      }
    }
  },

  '/api/v1/users/{user_id}/documents/{document_id}/details': {
    put: {
      tags: ['Documents'],
      summary: 'Api to update the document details.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'Id of a user',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'document_id',
          in: 'path',
          description: 'Id of a document',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/updateDocumentDetails'
            }
          }
        },
        description: 'Parameters to update documents',
        required: true
      },
      responses: {
        '200': {
          description: 'Document has been successfully updated'
        }
      }
    }
  },

  '/api/v1/users/{user_id}/documents/{document_id}/version': {
    put: {
      tags: ['Documents'],
      summary: 'Api to update the document version.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'Id of a user',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'document_id',
          in: 'path',
          description: 'Id of a document',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              $ref: '#/components/schemas/updateDocumentVersion'
            }
          }
        },
        description: 'Parameters to update documents',
        required: true
      },
      responses: {
        '200': {
          description: 'Document has been successfully updated'
        }
      }
    }
  },

  '/api/v1/documents/{document_id}/freeze': {
    put: {
      tags: ['Documents'],
      summary: 'Api to freeze or unfreeze the document.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'document_id',
          in: 'path',
          description: 'Id of a document',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/freezeDocument'
            }
          }
        },
        description: 'Parameters to freeze document',
        required: true
      },
      responses: {
        '200': {
          description: 'Document has been successfully frozen'
        }
      }
    }
  },

  '/api/v1/users/{user_id}/documents/{document_id}': {
    get: {
      tags: ['Documents'],
      summary: 'Api to get the document details.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'User ID',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'document_id',
          in: 'path',
          description: 'Document ID',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Document details have been successfully fetched'
        }
      }
    },

    delete: {
      tags: ['Documents'],
      summary: 'Api to delete the document.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'User Id',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'document_id',
          in: 'path',
          description: 'Document Id',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Document has been successfully deleted'
        }
      }
    }
  },

  '/api/v1/users/{user_id}/documents/{document_id}/download': {
    get: {
      tags: ['Documents'],
      summary: 'Api to download the document.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'User ID',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'document_id',
          in: 'path',
          description: 'Document ID',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Document has been successfully downloaded'
        }
      }
    }
  },

  '/api/v1/users/{user_id}/documents/{document_id}/transfer': {
    // Done
    post: {
      tags: ['Documents'],
      summary: 'Api to transfer the ownership of a document.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'User ID',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'document_id',
          in: 'path',
          description: 'Document Id',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/transferOwnershipRequest'
            }
          }
        },
        description: 'Parameters to transfer the ownership of a document',
        required: true
      },
      responses: {
        '200': {
          description: 'Document ownership has been transferred successfully.'
        }
      }
    }
  },

  '/api/v1/users/{user_id}/documents/{document_id}/share': {
    // Done
    post: {
      tags: ['Documents'],
      summary: 'Api to share the document.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'User ID',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'document_id',
          in: 'path',
          description: 'Document Id',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/shareDocumentRequest'
            }
          }
        },
        description: 'Parameters to share the document',
        required: true
      },
      responses: {
        '200': {
          description: 'Document has been shared successfully.'
        }
      }
    }
  },

  '/api/v1/users/{user_id}/documents/{document_id}/ownership-history': {
    get: {
      tags: ['Documents'],
      summary: 'Api to get the ownership history of document.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'User ID',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'document_id',
          in: 'path',
          description: 'Document ID',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'page_offset',
          in: 'query',
          description: 'Page offset',
          required: true,
          schema: {
            type: 'integer'
          }
        },
        {
          name: 'page_number',
          in: 'query',
          description: 'Page Number',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Ownership history has been successfully fetched'
        }
      }
    }
  },

  '/api/v1/users/{user_id}/documents': {
    get: {
      tags: ['Documents'],
      summary: 'Api to get the documents of a user.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'User ID',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'page_offset',
          in: 'query',
          description: 'Page offset',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'page_number',
          in: 'query',
          description: 'Page Number',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Documents have been successfully fetched.'
        }
      }
    },

    post: {
      tags: ['Documents'],
      summary: 'Api to upload a document.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'User ID',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              $ref: '#/components/schemas/uploadDocumentRequest'
            }
          }
        },
        description: 'Parameters to upload a document.',
        required: true
      },
      responses: {
        '200': {
          description: 'Document has been successfully uploaded'
        }
      }
    }
  },

  '/api/v1/users/{user_id}/documents-permission': {
    get: {
      tags: ['Documents'],
      summary: 'Api to get the documents by permission of a user.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'User ID',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'page_offset',
          in: 'query',
          description: 'Page offset',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'page_number',
          in: 'query',
          description: 'Page Number',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Documents have been successfully fetched.'
        }
      }
    }
  },

  '/api/v1/users/{user_id}/documents/{document_id}/version': {
    put: {
      tags: ['Documents'],
      summary: 'Api to update version of a document.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'user_id',
          in: 'path',
          description: 'User ID',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'document_id',
          in: 'path',
          description: 'document ID',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              $ref: '#/components/schemas/updateVersionRequest'
            }
          }
        },
        description: 'Parameters to upload a document.',
        required: true
      },
      responses: {
        '200': {
          description: 'Document has been successfully uploaded'
        }
      }
    }
  },

  '/api/v1/service-accounts/{service_account_id}/credentials': {
    get: {
      tags: ['Service-Accounts'],
      summary: 'API to get the credentials of service accounts.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        },

        {
          name: 'service_account_id',
          in: 'path',
          description: 'Id of service account',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description:
            'Credentials for the service accounts have been successfully fetched'
        }
      }
    }
  },

  '/api/v1/service-accounts': {
    get: {
      tags: ['Service-Accounts'],
      summary: 'API to get all service accounts of an organization.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'Service accounts details have been successfully fetched'
        }
      }
    }
  },

  '/api/v1/documents/verify-sha256': {
    // Done
    post: {
      tags: ['Public'],
      summary: 'Api to verify the document sha.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              $ref: '#/components/schemas/verifyDocumentSHARequest'
            }
          }
        },
        description: 'Parameters to verify the document sha.',
        required: true
      },
      responses: {
        '200': {
          description: 'SHA256 hash has been successfully verified.'
        }
      }
    }
  },

  '/api/v1/signup': {
    // Done
    post: {
      tags: ['Users'],
      summary: 'Register a user.',
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          description: 'JWT token header. Used for user Authorization',
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/registerUserRequest'
            }
          }
        },
        description: 'Parameters to register a user.',
        required: true
      },
      responses: {
        '200': {
          description: 'User has been successfully created'
        }
      }
    }
  }
};
