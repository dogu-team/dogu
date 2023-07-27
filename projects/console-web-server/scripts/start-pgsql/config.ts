import { env } from '../../src/env';

export const config = {
  containerName: 'dogu-pgsql',
  imageName: 'postgres:15.3',
  rootUser: env.DOGU_RDS_USERNAME,
  rootPassword: env.DOGU_RDS_PASSWORD,
  host: env.DOGU_RDS_HOST,
  port: env.DOGU_RDS_PORT,
  schema: env.DOGU_RDS_SCHEMA,
};

console.log('config', config);

export const pgsqlConnectionOptions = {
  host: config.host,
  port: config.port,
  user: config.rootUser,
  password: config.rootPassword,
  database: config.schema,
  ssl: false,
};
