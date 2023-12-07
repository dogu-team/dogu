import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';

// const DOGU_REDIS_PASSWORD = fs
//   .readFileSync('.env.local', 'utf8')
//   .split(os.EOL)
//   .map((line) => line.trim())
//   .map((line) => line.split('='))
//   .filter((keyValue) => keyValue.length === 2)
//   .filter(([key]) => key === 'DOGU_REDIS_PASSWORD')
//   .map(([, value]) => value)
//   .filter((value) => !!value)
//   .shift();
// if (!DOGU_REDIS_PASSWORD) {
//   throw new Error('DOGU_REDIS_PASSWORD is not set');
// }

// console.log('Start Redis');
// execSync(`redis-server --requirepass ${DOGU_REDIS_PASSWORD}`, { stdio: 'inherit' });

console.log('Start InfluxDB');
execSync(`influxd`, { stdio: 'inherit' });
