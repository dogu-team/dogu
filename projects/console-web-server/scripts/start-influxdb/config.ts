import { env } from '../../src/env';

export const config = {
  containerName: 'dogu-influxdb',
  imageName: 'influxdb:2.6.1',
  volumeName: 'influxdb-data',
  userName: 'admin',
  password: 'dogutech',
  token: env.DOGU_INFLUX_DB_TOKEN,
  bucket: env.DOGU_INFLUX_DB_BUCKET,
  org: env.DOGU_INFLUX_DB_ORG,
  port: env.DOGU_INFLUX_DB_PORT,
};

console.log('config', config);
