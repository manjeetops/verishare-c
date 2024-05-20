const TIME_STAMP = new Date().getTime()

export const CREATE_ORGANIZATION_TEST_DATA = {
  organizationName: `test-org-${TIME_STAMP}`,
  user: {
    'email': `test-org-${TIME_STAMP}@gmail.com`,
    'firstName': 'abc',
    'password': 'test123',
    'lastName': 'cde'
  }
}
