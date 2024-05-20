// FIXME: removed the below line
require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx']
});

const config = require('./config/app');

const { host, port, username, password, name: database } = config.get('db');

module.exports = {
  host,
  username,
  password,
  port,
  database,
  type: 'postgres',
  logging: false,
  synchronize: false,
  migrationsRun: false,
  entities: ['entity/*.js'],
  migrations: ['migration/*.js'],
  subscribers: ['subscriber/*.js'],
  cli: {
    entitiesDir: './entity',
    migrationsDir: './migration',
    subscribersDir: './subscriber'
  }
};
