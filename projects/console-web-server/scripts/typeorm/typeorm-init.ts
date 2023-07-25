import { node_package } from '@dogu-dev-private/build-tools';
import { PromiseOrValue, retry } from '@dogu-tech/common';
import process from 'process';
import { env } from '../../src/env';
import { FeatureConfig } from '../../src/feature.config';
import { PostgreSql } from '../utils/pgsql';
import { exec, execute, spawnWithFindPattern } from '../utils/utils';

export const pgsqlConnectionOptions = {
  host: env.DOGU_RDS_HOST,
  port: env.DOGU_RDS_PORT,
  user: env.DOGU_RDS_USERNAME,
  password: env.DOGU_RDS_PASSWORD,
  database: env.DOGU_RDS_SCHEMA,
  ssl: FeatureConfig.get('rdbSslConnection') ? { rejectUnauthorized: false } : false,
};
console.log('config', pgsqlConnectionOptions);

async function checkDbInitialized(): Promise<boolean> {
  console.log('Checking database initialized...');
  let resultValue: boolean = false;
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

async function createDbSchema(): Promise<void> {
  console.log('Create tables...');
  await retry(
    async () =>
      await spawnWithFindPattern(
        'yarn',
        ['run', 'typeorm:schema'], //
        /.*Schema synchronization finished successfully\..*/m,
      ),
    { retryCount: 3, retryInterval: 3000 },
  );
}

async function createFakeDbMigrations(): Promise<void> {
  console.log('Create migrations...');
  await execute('Create migration table...', () =>
    exec(`yarn run typeorm:fake`, {
      errorMessage: 'Error: typeorm migration table generation failed',
      retry: true,
      retryCount: 3,
      retryInterval: 3000,
    }),
  );
}

async function createSeedData(): Promise<void> {
  console.log('Create seeds...');
  await retry(
    async () => {
      await PostgreSql.on(pgsqlConnectionOptions, async (context) => {
        await context.query(
          'Create role bases...',
          `INSERT INTO project_role VALUES (1,'Admin',null,0,NOW(),NOW()), (2,'Write',null,0,NOW(),NOW()), (3,'Read',null,0,NOW(),NOW());`,
        );
        await context.query(
          'Create role bases...',
          `INSERT INTO organization_role VALUES (1,null,'Owner', 0, NOW(),NOW(), null), (2,null,'Admin', 0,NOW(),NOW(), null), (3,null,'Member', 0,NOW(),NOW(), null);`,
        );
      });
    },
    { retryCount: 3, retryInterval: 3000 },
  );
}

async function runDbMigration(): Promise<void> {
  console.log('Run migrations...');
  await exec(`yarn run typeorm:run`, {
    errorMessage: 'Error: run typeorm migration failed',
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
  const workspaceDir = node_package.findRootWorkspace();
  process.chdir(workspaceDir);
  const isInitialized = await checkDbInitialized();

  if (!isInitialized) {
    console.log('Database need to initaialize...');
    await createDbSchema();
    await createFakeDbMigrations();
    await createSeedData();
  } else {
    console.log('Database already initaialized');
    await runDbMigration();
  }

  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
