import {
  post,
  get,
  remove,
  put
} from '../helpers/fetchHelper';
// import { URL } from '../helpers/constants';
// import {
//   Document
// } from '../../entity/document';
// import of from 'await-of';

class DocumentAPIs {
  static async uploadDocument({
    accessToken,
    userId,
    formData,
    URL
  }) {
    const response = await post({
      accessToken,
      url: `${URL}/users/${userId}/documents`,
      opts: {
        formData
      }
    });
    return response;
  }

  static async attestDocument({
    documentId,
    accessToken,
    version,
    URL
  }) {
    const response = await post({
      accessToken,
      url: `${URL}/documents/${documentId}/attestations`,
      opts: {
        body: {
          version
        }
      }
    });
    return response;
  }

  static async freezeDocument({
    accessToken,
    documentId,
    status,
    URL
  }) {
    const response = await put({
      accessToken,
      url: `${URL}/documents/${documentId}/freeze`,
      opts: {
        body: {
          status
        }
      }
    });
    return response;
  }

  static async deleteDocument({
    accessToken,
    userId,
    documentId,
    URL
  }) {
    const response = await remove({
      accessToken,
      url: `${URL}/users/${userId}/documents/${documentId}`
    });
    return response;
  }

  static async shareDocument({
    accessToken,
    userId,
    documentId,
    receiverId,
    accessType,
    accessScope,
    URL
  }) {
    const response = await post({
      accessToken,
      url: `${URL}/users/${userId}/documents/${documentId}/share`,
      opts: {
        body: {
          receiverId,
          accessType,
          accessScope
        }
      }
    });
    return response;
  }

  static async getAttestations({
    accessToken,
    documentId,
    URL
  }) {
    const response = await get({
      accessToken,
      url: `${URL}/documents/${documentId}/attestations`,
    });
    return response;
  }

  static async getDocument({
    accessToken,
    userId,
    documentId,
    URL
  }) {
    const response = await get({
      accessToken,
      url: `${URL}/users/${userId}/documents/${documentId}`
    });
    return response;
  }

  static async getDocumentsList({
    accessToken,
    userId,
    pageOffset,
    pageNumber,
    URL
  }) {
    const response = await get({
      accessToken,
      url: `${URL}/users/${userId}/documents`,
      opts: {
        qs: {
          page_offset: pageOffset,
          page_number: pageNumber
        }
      }
    });
    return response;
  }

  static async getAllDocuments({
    accessToken,
    pageOffset,
    pageNumber,
    URL
  }) {
    const response = await get({
      accessToken,
      url: `${URL}/all-documents`,
      opts: {
        qs: {
          page_offset: pageOffset,
          page_number: pageNumber
        }
      }
    })
    return response;
  }

  static async updateDocumentDetails({
    accessToken,
    userId,
    documentId,
    name,
    description,
    url,
    URL
  }) {
    const response = await put({
      accessToken,
      url: `${URL}/users/${userId}/documents/${documentId}/details`,
      opts: {
        body: {
          name,
          description,
          url
        }
      }
    });
    return response
  }

  static async transferDocument({
    accessToken,
    userId,
    newOwnerId,
    newOwnerAddress,
    documentId,
    URL
  }) {
    const response = await post({
      accessToken,
      url: `${URL}/users/${userId}/documents/transfer`,
      opts: {
        body: {
          documentId,
          userId: newOwnerId,
          userAddress: newOwnerAddress
        }
      }
    })
    return response
  }

  static async getDocumentOwnershipHistory({
    accessToken,
    documentId,
    userId,
    pageOffset,
    pageNumber,
    URL
  }) {
    const response = await get({
      accessToken,
      url: `${URL}/users/${userId}/documents/${documentId}/ownership-history`,
      opts: {
        qs: {
          page_offset: pageOffset,
          page_number: pageNumber
        }
      }
    })
    return response
  }

  static async getAllTransfers({
    accessToken,
    URL
  }) {
    const response = await get({
      accessToken,
      url: `${URL}/transfers`,
    })
    return response
  }

  static async freezeDocument({
    accessToken,
    documentId,
    status,
    URL
  }) {
    const response = await put({
      accessToken,
      url: `${URL}/documents/${documentId}/freeze`,
      opts: {
        body: {
          status
        }
      }
    })
    return response
  }

  static async updateVersion({
    accessToken,
    userId,
    documentId,
    formData,
    URL
  }) {
    const response = await put({
      accessToken,
      url: `${URL}/users/${userId}/documents/${documentId}/version`,
      opts: {
        formData
      }
    })
    return response
  }

  // static async getDocumentfromDb(query) {
  //   const [document, err] = await of(Document.findOne(query));
  //   if (err) {
  //     throw new Error(err);
  //   }
  //   return document;
  // }
}

export default DocumentAPIs;