import { DataSourceOptions } from 'typeorm';
import { env } from './env';

export const config = {
  pipeline: {},
  gaurd: {
    validation: {},
    jwt: {
      logging: false,
    },
    role: {
      logging: false,
    },
  },
  middleware: {
    logger: {
      logging: false,
    },
  },
  runType: env.DOGU_BILLING_RUN_TYPE,
  rds: {
    host: env.DOGU_BILLING_RDS_HOST,
    port: env.DOGU_BILLING_RDS_PORT,
    username: env.DOGU_BILLING_RDS_USERNAME,
    password: env.DOGU_BILLING_RDS_PASSWORD,
    schema: env.DOGU_BILLING_RDS_SCHEMA,
    ssl: env.DOGU_BILLING_RDS_SSL_CONNECTION ? { rejectUnauthorized: false } : false,
  },
};

export const dataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  database: config.rds.schema,
  host: config.rds.host,
  port: config.rds.port,
  username: config.rds.username,
  password: config.rds.password,
  logging: false,
  // synchronize: false,
  entities: [__dirname + `/db/entity/*.{ts,js}`],
  migrations: [__dirname + `/db/migrations/${config.runType}/*.{ts,js}`],
  migrationsRun: false,
  migrationsTableName: 'migration',
  useUTC: true,
  ssl: config.rds.ssl,
};

console.warn('[DB Config]', {
  database: dataSourceConfig.database,
  host: dataSourceConfig.host,
  port: dataSourceConfig.port,
  username: dataSourceConfig.username,
  useUTC: true,
  syncronize: dataSourceConfig.synchronize,
});
