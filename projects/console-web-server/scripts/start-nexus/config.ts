import os from 'os';
import { env } from '../../src/env';

const arch = os.arch();

const imageName = arch === 'x64' ? 'sonatype/nexus3:3.56.0' : arch === 'arm64' ? 'klo2k/nexus3:latest' : null;
if (!imageName) throw new Error(`Unsupported arch: ${arch}`);

export const config = {
  containerName: 'dogu-nexus',
  imageName,
  volumeName: 'nexus-data',
  userName: env.DOGU_NEXUS_USERNAME,
  password: env.DOGU_NEXUS_PORT,
  host: env.DOGU_NEXUS_HOST,
  port: env.DOGU_NEXUS_PORT,
};

process.env.DOGU_NEXUS_URL = `http://${config.host}:${config.port}`;
process.env.DOGU_NEXUS_CONTAINER_NAME = config.containerName;

console.log('config', config);
