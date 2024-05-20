import config from '../../config'
import deqodeLogo from './Logo.png'
import boeingLogo from './boeingshort.png'

const organization = config.get('organizationName')

let Logo

switch (organization) {
  case "boeing":
    Logo = boeingLogo
    break;

  case "deqode":
    Logo = deqodeLogo
    break;

  default:
    break;
}

export { Logo }
