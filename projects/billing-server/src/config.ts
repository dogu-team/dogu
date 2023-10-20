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
  runType: env.DOGU_CLIENT_ADMIN_RUN_TYPE,
  rds: {
    host: env.DOGU_CLIENT_ADMIN_RDS_HOST,
    port: env.DOGU_CLIENT_ADMIN_RDS_PORT,
    username: env.DOGU_CLIENT_ADMIN_RDS_USERNAME,
    password: env.DOGU_CLIENT_ADMIN_RDS_PASSWORD,
    schema: env.DOGU_CLIENT_ADMIN_RDS_SCHEMA,
    ssl: env.DOGU_CLIENT_ADMIN_RDS_SSL_CONNECTION ? { rejectUnauthorized: false } : false,
  },
  apiToken: env.DOGU_CLIENT_ADMIN_API_TOKEN,
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
