import { env } from '../../src/env';

export const config = {
  containerName: 'dogu-pgsql',
  imageName: 'postgres:15.3',
  connectionString: env.DOGU_CONSOLE_DB_URL,
};

console.log('config', config);

console.log('ENV', env.DOGU_RUN_TYPE);

export const pgsqlConnectionOptions = {
  connectionString: env.DOGU_CONSOLE_DB_URL,
  ssl: env.DOGU_CONSOLE_DB_SSL_CONNECTION ? { rejectUnauthorized: false } : false,
};
