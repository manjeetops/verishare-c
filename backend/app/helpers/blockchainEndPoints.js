const endPoints = ({ orgId, documentId, userId, action }) => {
  const endpoints = {
    add_account: {
      method: 'POST',
      endpoint: '/users'
    },
    update_user_status: {
      method: 'PUT',
      endpoint: `/users/${userId}`
    },
    get_user_by_id: {
      method: 'GET',
      endpoint: `/users/${userId}`
    },
    get_all_users: {
      method: 'GET',
      endpoint: `/users`
    },
    create_organization: {
      method: 'POST',
      endpoint: `/organizations`
    },
    update_org_status: {
      method: 'PUT',
      endpoint: `/organizations/${orgId}`
    },
    get_organization: {
      method: 'GET',
      endpoint: `/organizations/${orgId}`
    },
    get_all_organizations: {
      method: 'GET',
      endpoint: `/organizations`
    },
    get_orgaization_users: {
      method: 'GET',
      endpoint: `/organizations/${orgId}/users`
    },
    add_document: {
      method: 'POST',
      endpoint: `/documents`
    },
    update_version: {
      method: 'PUT',
      endpoint: `/documents/${documentId}/version`
    },
    update_document_details: {
      method: 'PUT',
      endpoint: `/documents/${documentId}`
    },
    transfer_document: {
      method: 'POST',
      endpoint: `/documents/${documentId}/transfer`
    },
    share_document: {
      method: 'POST',
      endpoint: `/documents/${documentId}/share`
    },
    delete_document: {
      method: 'DELETE',
      endpoint: `/documents/${documentId}`
    },
    freeze_document: {
      method: 'PUT',
      endpoint: `/documents/${documentId}/freeze`
    },
    get_document: {
      method: 'GET',
      endpoint: `/documents/${documentId}`
    },
    download_document: {
      method: 'GET',
      endpoint: `/documents/${documentId}/download`
    },
    get_user_documents: {
      method: 'GET',
      endpoint: `/users/${userId}/documents`
    },
    get_documents_by_user_permission: {
      method: 'GET',
      endpoint: `/users/${userId}/documents-permission`
    },
    get_organization_documents: {
      method: 'GET',
      endpoint: `/organizations/${orgId}/documents`
    },
    attest_document: {
      method: 'POST',
      endpoint: `/documents/${documentId}/attestations`
    },
    get_document_attestations: {
      method: 'GET',
      endpoint: `/documents/${documentId}/attestations`
    },
  };
  return endpoints[action];
};

export { endPoints };
