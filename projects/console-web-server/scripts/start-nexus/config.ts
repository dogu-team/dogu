import os from 'os';
import { env } from '../../src/env';

const arch = os.arch();

const image = arch === 'x64' ? 'sonatype/nexus3:3.56.0' : arch === 'arm64' ? 'klo2k/nexus3:latest' : null;
if (!image) throw new Error(`Unsupported arch: ${arch}`);

export const config = {
  containerName: 'dogu-nexus',
  userName: env.DOGU_NEXUS_USERNAME,
  password: env.DOGU_NEXUS_PORT,
  host: env.DOGU_NEXUS_HOST,
  port: env.DOGU_NEXUS_PORT,
  volume: 'nexus-data',
  image,
};

process.env.DOGU_NEXUS_URL = `http://${config.host}:${config.port}`;

console.log('config', config);
