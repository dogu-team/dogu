import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';

const envs = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(os.EOL)
    .map((line) => line.trim())
    .map((line) => line.split('='))
    .filter((keyValue) => keyValue.length === 2)
    .filter(([, value]) => !!value),
);

const DOGU_INFLUX_DB_ORG = envs.DOGU_INFLUX_DB_ORG;
if (!DOGU_INFLUX_DB_ORG) {
  throw new Error('Environment variable DOGU_INFLUX_DB_ORG is not set');
}

const DOGU_INFLUX_DB_BUCKET = envs.DOGU_INFLUX_DB_BUCKET;
if (!DOGU_INFLUX_DB_BUCKET) {
  throw new Error('Environment variable DOGU_INFLUX_DB_BUCKET is not set');
}

const DOGU_INFLUX_DB_TOKEN = envs.DOGU_INFLUX_DB_TOKEN;
if (!DOGU_INFLUX_DB_TOKEN) {
  throw new Error('Environment variable DOGU_INFLUX_DB_TOKEN is not set');
}

const DOGU_INFLUX_DB_USERNAME = envs.DOGU_INFLUX_DB_USERNAME;
if (!DOGU_INFLUX_DB_USERNAME) {
  throw new Error('Environment variable DOGU_INFLUX_DB_USERNAME is not set');
}

const DOGU_INFLUX_DB_PASSWORD = envs.DOGU_INFLUX_DB_PASSWORD;
if (!DOGU_INFLUX_DB_PASSWORD) {
  throw new Error('Environment variable DOGU_INFLUX_DB_PASSWORD is not set');
}

console.log('Start InfluxDB');
execSync(`influxd`, {
  stdio: 'inherit',
  env: {
    ...process.env,
    DOCKER_INFLUXDB_INIT_MODE: 'setup',
    DOCKER_INFLUXDB_INIT_USERNAME: DOGU_INFLUX_DB_USERNAME,
    DOCKER_INFLUXDB_INIT_PASSWORD: DOGU_INFLUX_DB_PASSWORD,
    DOCKER_INFLUXDB_INIT_ORG: DOGU_INFLUX_DB_ORG,
    DOCKER_INFLUXDB_INIT_BUCKET: DOGU_INFLUX_DB_BUCKET,
    DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: DOGU_INFLUX_DB_TOKEN,
  },
});
