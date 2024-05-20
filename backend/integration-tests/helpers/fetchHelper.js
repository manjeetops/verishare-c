import rp from 'request-promise'
import of from 'await-of'

const requestWrapper = async (headers, url, method, opts) => {
  const options = {
    method,
    headers,
    json: true,
    uri: url,
    followRedirect: false,
    withCredentials: true,
    ...opts
  }

  const [response, err] = await of(rp(options))
  if (err) {
    throw new Error(err)
  }
  return response
}

const getHeader = (accessToken, basic, rootToken) => {
  let headers = {
    // 'Content-Type': 'application/json'
  }
  if (accessToken || basic || rootToken) {
    // TODO: replacce basic token with super-admin credentials
    headers['Authorization'] = rootToken || (
      basic
        ? `Basic ${Buffer.from(basic.username + ':' + basic.password).toString('base64')}`
        : `Bearer ${accessToken}`
    )
  }
  return headers
}

// Get Request
const get = async ({ url, accessToken, basic, opts }) => {
  const headers = getHeader(accessToken, basic)
  return requestWrapper(headers, url, 'GET', opts)
}

// Post request
const post = async ({ url, accessToken, rootToken, basic, opts }) => {
  // rootToken is required for seth-sdk APIs
  const headers = getHeader(accessToken, basic, rootToken)
  return requestWrapper(headers, url, 'POST', opts)
}

// Put request
const put = async ({ url, accessToken, basic, opts }) => {
  const headers = getHeader(accessToken, basic)
  return requestWrapper(headers, url, 'PUT', opts)
}

// Delete request
const remove = async ({ url, accessToken, basic, opts }) => {
  const headers = getHeader(accessToken, basic)
  return requestWrapper(headers, url, 'DELETE', opts)
}

export {
  get,
  post,
  put,
  remove
}
