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
  db: {
    billingUrl: env.DOGU_BILLING_DB_URL,
    consoleUrl: env.DOGU_CONSOLE_DB_READ_URL,
    ssl: env.DOGU_BILLING_DB_SSL_CONNECTION ? { rejectUnauthorized: false } : false,
  },
};

export const dataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  url: config.db.billingUrl,
  logging: false,
  // synchronize: false,
  entities: [__dirname + `/db/entity/*.{ts,js}`],
  migrations: [__dirname + `/db/migrations/${config.runType}/*.{ts,js}`],
  migrationsRun: false,
  migrationsTableName: 'migration',
  useUTC: true,
  ssl: config.db.ssl,
};

console.warn('[DB Config]', {
  url: dataSourceConfig.url,
  useUTC: true,
  syncronize: dataSourceConfig.synchronize,
});
