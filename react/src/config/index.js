import convict from 'convict';

var config = convict({
  server: {
    baseUrl: {
      doc: "Base url of the server",
      format: "url",
      default: `${window.location.protocol}//${window.location.hostname}/`,
      env: "REACT_APP_BACKEND_URL",
    },
  },
  organizationName: {
    doc: "Organization name for logo",
    default: "deqode",
    env: "REACT_APP_ORGANIZATION_NAME",
  },
});

config.validate({ allowed: 'strict' });

export default config;
