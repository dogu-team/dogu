import { node_package } from '@dogu-dev-private/build-tools';
import process from 'process';
import { env } from '../../src/env';
import { PostgreSql } from '../utils/pgsql';
import { exec, execute, spawnWithFindPattern } from '../utils/utils';

export const pgsqlConnectionOptions = {
  host: env.DOGU_RDS_HOST,
  port: env.DOGU_RDS_PORT,
  user: env.DOGU_RDS_USERNAME,
  password: env.DOGU_RDS_PASSWORD,
  database: env.DOGU_RDS_SCHEMA,
};
console.log('config', pgsqlConnectionOptions);

(async (): Promise<void> => {
  const workspaceDir = node_package.findRootWorkspace();
  process.chdir(workspaceDir);

  try {
    await execute('Check initaialized...', async () => {
      await PostgreSql.on(pgsqlConnectionOptions, async (context) => {
        const rv = await context.query('Check initaialized...', `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'`);
        if (rv.rows[0].count > 0) {
          throw new Error('Already initialized');
        }
      });
    });

    console.log('Database need to initaialize...');

    await execute('Create database schema...', async () => await spawnWithFindPattern('yarn', ['run', 'typeorm:schema'], /.*Schema synchronization finished successfully\..*/m));

    await execute('Create migration table...', () =>
      exec(`yarn run typeorm:fake`, {
        errorMessage: 'Error: typeorm migration table generation failed',
      }),
    );

    await execute('Create seed datas...', async () => {
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
    });
  } catch (error) {
    console.log('Database already initaialized');

    await execute('Run migration...', () =>
      exec(`yarn run typeorm:run`, {
        errorMessage: 'Error: run typeorm migration failed',
      }),
    );
  }

  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
