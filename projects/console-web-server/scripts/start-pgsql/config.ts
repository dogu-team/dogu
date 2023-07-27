import { env } from '../../src/env';
import { FeatureConfig } from '../../src/feature.config';

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

console.log('ENV', env.DOGU_RUN_TYPE);

export const tempRunType = process.env.DOGU_RUN_TYPE;

process.env.DOGU_RUN_TYPE = 'local';

export const pgsqlConnectionOptions = {
  host: config.host,
  port: config.port,
  user: config.rootUser,
  password: config.rootPassword,
  database: config.schema,
  ssl: FeatureConfig.get('rdbSslConnection') ? { rejectUnauthorized: false } : false,
};
