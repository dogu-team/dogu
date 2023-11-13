import { node_package } from '@dogu-dev-private/build-tools';
import { PromiseOrValue, retry } from '@dogu-tech/common';
import process from 'process';
import { config } from '../../src/config';
import { createDbSchema, createFakeDbMigrations } from '../common/common';
import { PostgreSql } from '../utils/pgsql';
import { exec } from '../utils/utils';

const pgsqlConnectionOptions = {
  connectionString: config.db.billingUrl,
  ssl: config.db.ssl,
};

console.log('config', pgsqlConnectionOptions);

async function checkDbInitialized(): Promise<boolean> {
  console.log('Checking database initialized...');
  let resultValue = false;
  await retry(
    async () => {
      await PostgreSql.on(pgsqlConnectionOptions, async (context) => {
        const rv = await context.query('Check initaialized...', `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'`);
        if (rv.rows[0].count > 0) {
          resultValue = true;
        } else {
          resultValue = false;
        }
      });
    },
    { retryCount: 3, retryInterval: 3000 },
  );
  return resultValue;
}

async function runDbMigration(cwd: string): Promise<void> {
  console.log('Run migrations...');
  await exec(`yarn run typeorm:run`, {
    errorMessage: 'Error: run typeorm migration failed',
    cwd,
    retry: true,
    retryCount: 3,
    retryInterval: 3000,
    resultChecker: <Result>(result: PromiseOrValue<Result>): boolean => {
      if ('code' in result && result['code'] !== 0) {
        console.error(`return code is not 0. code: ${result['code']}`);
        return false;
      }
      return true;
    },
  });
}

(async (): Promise<void> => {
  const cwd = process.cwd();
  const workspaceDir = node_package.findRootWorkspace();
  process.chdir(workspaceDir);
  const isInitialized = await checkDbInitialized();

  if (!isInitialized) {
    console.log('Database need to initaialize...');
    await createDbSchema();
    await createFakeDbMigrations();
  } else {
    console.log('Database already initaialized');
    await runDbMigration(cwd);
  }

  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
