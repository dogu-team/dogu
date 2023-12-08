import { spawn } from 'child_process';
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

const DOGU_INFLUX_DB_USERNAME = envs.DOGU_INFLUX_DB_USERNAME;
if (!DOGU_INFLUX_DB_USERNAME) {
  throw new Error('Environment variable DOGU_INFLUX_DB_USERNAME is not set');
}

const DOGU_INFLUX_DB_PASSWORD = envs.DOGU_INFLUX_DB_PASSWORD;
if (!DOGU_INFLUX_DB_PASSWORD) {
  throw new Error('Environment variable DOGU_INFLUX_DB_PASSWORD is not set');
}

async function run(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit', shell: true });
    proc.on('exit', (code, signal) => {
      if (code) {
        console.error(`Command \`${command} ${args.join(' ')}\` exited with code ${code}`);
        reject(code);
      } else if (signal) {
        console.error(`Command \`${command} ${args.join(' ')}\` was killed by signal ${signal}`);
        reject(signal);
      } else {
        resolve();
      }
    });
  });
}

setTimeout(() => {
  console.log('Setup InfluxDB');
  run('influx', [
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
  ]).catch((error) => {
    console.error('Failed to setup InfluxDB');
    console.error(error);
    process.exit(1);
  });
}, 10000);

console.log('Start InfluxDB');
run('influxd').catch((error) => {
  console.error('Failed to start InfluxDB');
  console.error(error);
  process.exit(1);
});
