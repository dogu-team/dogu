import { env } from '../../src/env';

export const config = {
  containerName: 'dogu-influxdb',
  userName: 'admin',
  password: 'dogutech',
  token: env.DOGU_INFLUX_DB_TOKEN,
  bucket: env.DOGU_INFLUX_DB_BUCKET,
  org: env.DOGU_INFLUX_DB_ORG,
};

console.log('config', config);
