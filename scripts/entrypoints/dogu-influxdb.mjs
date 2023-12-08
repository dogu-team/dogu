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

setTimeout(() => {
  console.log('Setup InfluxDB');
  execSync(
    [
      'influx',
      'setup',
      '--username',
      DOGU_INFLUX_DB_USERNAME,
      '--password',
      DOGU_INFLUX_DB_PASSWORD,
      '--org',
      DOGU_INFLUX_DB_ORG,
      '--bucket',
      DOGU_INFLUX_DB_BUCKET,
      '--force',
    ].join(' '),
    {
      stdio: 'inherit',
    },
  );
}, 10000);

console.log('Start InfluxDB');
execSync(`influxd`, {
  stdio: 'inherit',
});
