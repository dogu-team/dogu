import { WebSocketProxyId } from '@dogu-private/console-host-agent';
import { DeviceId, OrganizationId } from '@dogu-private/types';
import { findParentPackageJson, PackageJson } from '@dogu-tech/node';
import { DataSourceOptions } from 'typeorm';
import { CONSOLE_BACKEND_ENTITIES_PATH } from './db/entity/index';
import { env } from './env';
import { logger } from './module/logger/logger.instance';

const packageJson = new PackageJson(findParentPackageJson());

export const config = {
  pipeline: {},
  version: packageJson.doc.version as string,
  gaurd: {
    validation: {
      emailVerified: true,
      organiationRole: true,
      projectRole: true,
      hostVerified: true,
      deviceAccess: true,
      remote: true,
    },
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
  google: {
    oauth: {
      login: {
        clientId: env.DOGU_CONSOLE_GOOGLE_OAUTH_LOGIN_CLIENT_ID,
        clientSecret: env.DOGU_CONSOLE_GOOGLE_OAUTH_LOGIN_CLIENT_SECRET,
        callbackUrl: `${env.DOGU_API_BASE_URL}/registery/google/callback`,
      },
    },
  },
  redis: {
    options: {
      host: env.DOGU_REDIS_HOST,
      port: env.DOGU_REDIS_PORT,
      password: env.DOGU_REDIS_PASSWORD,
      db: env.DOGU_REDIS_DB,
    },
    key: {
      deviceParam: (organizationId: OrganizationId, deviceId: DeviceId): string => `/organizations/${organizationId}/devices/${deviceId}/params`,
      deviceResult: (organizationId: OrganizationId, deviceId: DeviceId, resultId: string): string => `/organizations/${organizationId}/devices/${deviceId}/results/${resultId}`,
      deviceStreamingSessionParam: (deviceId: DeviceId): string => `device-streaming-session/${deviceId}/params`,
      updateConnection: '/updateConnection',
      WebSocketProxyReceive: (organizationId: OrganizationId, deviceId: DeviceId, webSocketProxyId: WebSocketProxyId): string =>
        `/organizations/${organizationId}/devices/${deviceId}/webSocketProxies/${webSocketProxyId}/receives`,
    },
    expireSeconds: 10 * 60,
    deviceStreamingExpireSeconds: 7,
  },
  influxdb: {
    host: env.DOGU_INFLUX_DB_HOST,
    port: env.DOGU_INFLUX_DB_PORT,
    token: env.DOGU_INFLUX_DB_TOKEN,
    org: env.DOGU_INFLUX_DB_ORG,
    bucket: env.DOGU_INFLUX_DB_BUCKET,
    url: `http://${env.DOGU_INFLUX_DB_HOST}:${env.DOGU_INFLUX_DB_PORT}`,
  },
  license: {
    url: env.DOGU_LICENSE_SERVER_URL,
    companyName: env.DOGU_LICENSE_COMPANY_NAME,
  },
  fileService: {
    s3: {
      accessKeyId: env.DOGU_AWS_KEY_ID,
      secretAccessKey: env.DOGU_AWS_ACCESS_KEY,
      userBucket: env.DOGU_USER_BUCKET,
      orgBucket: env.DOGU_ORGANIZATION_BUCKET,
      publicBucket: env.DOGU_PUBLIC_BUCKET,
    },
    nexus: {
      host: env.DOGU_NEXUS_HOST,
      port: env.DOGU_NEXUS_PORT,
      url: `${env.DOGU_NEXUS_PROTOCOL}://${env.DOGU_NEXUS_HOST}:${env.DOGU_NEXUS_PORT}`,
      username: env.DOGU_NEXUS_USERNAME,
      password: env.DOGU_NEXUS_PASSWORD,
    },
  },
  aws: {
    keyId: env.DOGU_AWS_KEY_ID,
    accessKey: env.DOGU_AWS_ACCESS_KEY,
  },
  virtualWebSocket: {
    pop: {
      count: 10,
      intervalMilliseconds: 100,
    },
  },
  event: {
    updateConnection: {
      push: {
        intervalMilliseconds: 1000,
      },
      pop: {
        intervalMilliseconds: 1000,
      },
    },
  },
  host: {
    heartbeat: {
      allowedSeconds: 10,
    },
  },
  device: {
    heartbeat: {
      allowedSeconds: 10,
    },
    param: {
      timeoutMilliseconds: 60 * 1000,
    },
    message: {
      intervalMilliseconds: 300,
    },
  },
  deviceJob: {
    heartbeat: {
      allowedSeconds: 10,
    },
    timeoutMilliseconds: 10 * 1000,
  },
  deviceAndWebDriver: {
    heartbeat: {
      allowedSeconds: 300,
    },
    lifetime: {
      allowedSeconds: 1800,
    },
  },
};

export const dataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  database: env.DOGU_RDS_SCHEMA,
  host: env.DOGU_RDS_HOST,
  port: env.DOGU_RDS_PORT,
  username: env.DOGU_RDS_USERNAME,
  password: env.DOGU_RDS_PASSWORD,
  logging: false,
  // synchronize: false,
  entities: [CONSOLE_BACKEND_ENTITIES_PATH],
  migrations: [__dirname + `/db/migrations/${env.DOGU_RUN_TYPE}/*.{ts,js}`],
  migrationsRun: false,
  migrationsTableName: 'migration',
  useUTC: true,
  ssl: env.DOGU_RDS_SSL_CONNECTION ? { rejectUnauthorized: false } : false,
};

logger.warn('[DB Config]', {
  database: dataSourceConfig.database,
  host: dataSourceConfig.host,
  port: dataSourceConfig.port,
  username: dataSourceConfig.username,
  useUTC: true,
  syncronize: dataSourceConfig.synchronize,
});
