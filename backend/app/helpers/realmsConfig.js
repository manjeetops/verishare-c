import config from '../../config/app'
// import Rotation from '../../app/libs/rotation'
// import of from 'await-of'

const { keycloakInternalBaseURL } = config.get('keycloak')

export default {
  'org-1': {
    'realm': 'org-1',
    'auth-server-url': `${keycloakInternalBaseURL}/auth/org-1`
  },
  'org-2': {
    'realm': 'org-2',
    'auth-server-url': `${keycloakInternalBaseURL}/auth/org-2`
  }
}

// const { keycloakInternalBaseURL } = config.get('keycloak')

// const getRotationObj = (realmName) => {
//   return new Rotation({
//     realmUrl: `${keycloakInternalBaseURL}/auth/realms/${realmName}`,
//     minTimeBetweenJwksRequests: 300
//   })
// }

// const getJWKs = async (realmName) => {
//   const rotationObj = getRotationObj(realmName)
//   // FIXME: retrieveJWKs discuss
//   // const [response] = await of(rotationObj.retrieveJWKs())
//   const [response, error] = await of(rotationObj.getJWKs())
//   return {
//     // 'key': ((response.keys && response.keys.length && response.keys[0]) || {})
//     'key': response
//   }
// }

// const initializeAllJWKS = (realmKeys, orgData) => {
//   const promises = []
//   realmKeys.forEach((key) => {
//     promises.push(() => getJWKs(orgData[key].realm))
//   })
//   return promises
// }

// export default async () => {
//   const orgData = {
//     'org-1': {
//       'realm': 'org-1',
//       'auth-server-url': `${keycloakInternalBaseURL}/auth/org-1`
//     },
//     'org-2': {
//       'realm': 'org-2',
//       'auth-server-url': `${keycloakInternalBaseURL}/auth/org-2`
//     }
//   }
//   const realmKeys = Object.keys(orgData)
//   const jwkPromises = initializeAllJWKS(realmKeys, orgData)
//   const [response, err] = await of(Promise.all(jwkPromises.map((promise) => promise())))
//   console.log('respone ', response)
//   if (err) {
//     // TODO: throw error
//   }
//   response.forEach((data, index) => {
//     orgData[realmKeys[index]]['jwkpem'] = data['key']
//   })
//   return orgData
// }
