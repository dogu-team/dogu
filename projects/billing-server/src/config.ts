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
  paddle: {
    /**
     * TODO: move to env
     * @description this is sandbox api key
     */
    apiKey: '7dc2e51c683f1426e5bfa78755c403be85d97f5284740e1c66',
    // apiKey: '4c8096b497b80fe73df17b2b148b51dafda5055a614fe99614',
    notificationKey: 'pdl_ntfset_01hfvf6np93stpzgg99tzqh67f_vP5ukftxMEHcQtReFTbhVMCRBXPVLejU',
    // notificationKey: 'pdl_ntfset_01hgcr3c29jygr78x5w9ef6wgk_uOa/a63IbyHRgkpWT3RqZMX4Z7KMHLtV',
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
