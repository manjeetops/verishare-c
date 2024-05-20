import of from 'await-of'
import { createQueryBuilder } from 'typeorm'
import { Account } from '../../entity/account'
import { post } from '../helpers/fetchHelper'
import { CREATE_ORGANIZATION_TEST_DATA } from '../testData'
import { URL } from '../helpers/constants'

class OrganizationAPIs {
  static async createOrganization (superAdminCreds) {
    const response = await post({
      url: `${URL}/organization/create`,
      basic: superAdminCreds,
      opts: {
        body: CREATE_ORGANIZATION_TEST_DATA
      }
    })
    return response
  }

  static async getUser (id) {
    const params = ['"id", "type", "orgId", "email"']
    const [users, err] = await of(createQueryBuilder(Account, 'account')
      .select(params)
      .where('account."orgId" = :id', { id })
      .getRawMany())
    if (err) {
      console.error('Error while fetching the users ', err)
      throw new Error(err)
    }
    return users
  }
}

export default OrganizationAPIs
