const convict = require('convict')

const config = convict({
  app: {
    name: {
      doc: 'deqode rest api service',
      format: String,
      default: 'deqode rest api service'
    }
  },
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'staging', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  log_level: {
    doc: 'level of logs to show',
    format: String,
    default: 'debug',
    env: 'LOG_LEVEL'
  },
  org_roles: {
    employee: {
      doc: 'Org employee role',
      format: String,
      default: 'org-employee'
    },
    admin: {
      doc: 'Org admin role',
      format: String,
      default: 'org-admin'
    },
    service_provider: {
      doc: 'Org service provider role',
      format: String,
      default: 'org-service-provider'
    }
  },
  db: {
    host: {
      doc: 'Database host name/IP',
      format: '*',
      default: 'postgres-0',
      env: 'POSTGRES_HOST'
    },
    port: {
      doc: 'Database port',
      format: 'port',
      default: 5432,
      env: 'POSTGRES_PORT'
    },
    username: {
      doc: 'Database user name',
      format: String,
      default: 'postgres',
      env: 'POSTGRES_USER'
    },
    password: {
      doc: 'Database password',
      format: String,
      default: 'password',
      env: 'POSTGRES_PASSWORD'
    },
    name: {
      doc: 'Database name',
      format: String,
      default: 'deqode',
      env: 'DB_NAME'
    }
  },
  deqode: {
    super_admin_username: {
      doc: 'Super admin username',
      format: String,
      default: 'deqode',
      env: 'SUPERADMIN_USERNAME'
    },
    super_admin_password: {
      doc: 'Super admin password',
      format: String,
      default: 'deqode@123',
      env: 'SUPERADMIN_PASSWORD'
    },
    from_address: {
      doc: 'Invitation from address',
      format: String,
      default: 'deqode@admin.com',
      env: 'FROM_EMAIL_ADDRESS'
    }
  },
  keycloak: {
    admin: {
      username: {
        doc: 'Keycloak username',
        format: String,
        default: 'admin',
        env: 'KEYCLOAK_USER'
      },
      password: {
        doc: 'Keycloak password',
        format: String,
        default: 'admin@123',
        env: 'KEYCLOAK_PASSWORD'
      }
    },

    base_url: {
      doc: 'Keycloak base url',
      format: String,
      default: 'https://org1.dev-verishare.ml',
      env: 'KEYCLOAK_BASE_URL'
    },

    default_client: {
      doc: 'Keycloak default client',
      format: String,
      default: 'react',
      env: 'KEYCLOAK_DEFAULT_CLIENT'
    },

    internal_base_url: {
      doc: 'Keycloak internal url',
      format: String,
      default: 'http://keycloak-0:8080',
      env: 'KEYCLOAK_INTERNAL_BASE_URL'
    },

    realm_name: {
      doc: 'Keycloak realm name',
      format: String,
      default: 'deqode',
      env: 'REALM_NAME'
    }
  },
  email: {
    host: {
      doc: 'Email host',
      format: String,
      default: 'mailhog',
      env: 'EMAIL_HOST'
    },
    username: {
      doc: 'Email username',
      format: String,
      default: 'deqode',
      env: 'MAILHOG_USERNAME'
    },
    password: {
      doc: 'Email password',
      format: String,
      default: 'deqode@123',
      env: 'MAILHOG_PASSWORD'
    },
    port: {
      doc: 'Email port',
      format: 'port',
      default: 1025,
      env: 'EMAIL_PORT'
    },
    secure: {
      doc: 'Email secure',
      format: Boolean,
      default: false,
      env: 'EMAIL_SECURE'
    }
  },
  blockchain: {
    base_url: {
      doc: 'Blockchain url',
      format: String,
      default: 'http://localhost:8432',
      env: 'BLOCKCHAIN_URL'
    },
    socket_url: {
      doc: 'Blockchain socket url',
      format: String,
      default: 'http://localhost:8432',
      env: 'BLOCKCHAIN_SOCKET_URL'
    },
    timeout: {
      doc: 'blockchain service timeout',
      format: Number,
      default: 15000,
      env: 'BLOCKCHAIN_REQUEST_TIMEOUT'
    },
    retry: {
      max_retries: {
        doc: 'Max Retries on error',
        format: Number,
        default: 10,
        env: 'BLOCKCHAIN_MAX_RETRIES'
      },
      exponential_factor: {
        doc: 'Retry exponential factor',
        format: Number,
        default: 2,
        env: 'BLOCKCHAIN_RETRY_FACTOR'
      }
    }
  },

  limiter: {
    redis: {
      url: {
        doc: 'Redis connection URL',
        format: String,
        default: 'redis://redis-0:6379/1',
        env: 'REDIS_URL',
        sensitive: true
      }
    },
    max_concurrent_requests: {
      doc: 'Max concurrent requests',
      format: Number,
      default: 1,
      env: 'MAX_CONCURRENT_REQUESTS'
    },
    wait_between_requests: {
      doc: 'Min milliseconds to wait bw sending requests to blockchain',
      format: Number,
      default: 500,
      env: 'MIN_WAIT_BW_REQUESTS'
    },
    datastore: {
      doc: 'Where the limiter stores its internal state',
      format: String,
      default: 'redis',
      env: 'DATASTORE'
    }
  },

})

config.validate({ allowed: 'strict' })

module.exports = config
