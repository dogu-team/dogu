import { node_package } from '@dogu-dev-private/build-tools';
import { PostgreSql } from '../utils/pgsql';
import { exec, execute, spawnWithFindPattern, which } from '../utils/utils';
import { config, pgsqlConnectionOptions } from './config';

(async (): Promise<void> => {
  const currentDir = process.cwd();
  const workspaceDir = node_package.findRootWorkspace();
  process.chdir(workspaceDir);

  await execute('Checking Docker...', () => which('docker', { errorMessage: 'Error: Docker is not installed' }));
  await execute('Pulling image...', () => exec('docker pull postgres', { errorMessage: 'Error: Docker pull failed', retry: true }));
  await execute('Stopping container...', async () => {
    const { stdout } = await exec(`docker ps -a --filter name=${config.containerName} --format "{{.ID}}"`, { errorMessage: 'Error: Docker ps failed' });
    const containerId = stdout.trim();
    if (containerId) {
      console.log(`Container found: ${containerId}`);
      await execute('Removing container...', () => exec(`docker rm -f ${containerId}`, { errorMessage: 'Error: Docker remove failed' }));
    } else {
      console.log('Container not found');
    }
  });

  await execute('Starting container...', () =>
    exec(
      `docker run -d --name ${config.containerName} -e POSTGRES_DB=${config.schema} -e POSTGRES_USER=${config.rootUser} -e POSTGRES_PASSWORD=${config.rootPassword} -e TZ=Etc/UTC -p ${config.port}:5432 -m 2g --restart always postgres:15.3`,
      {
        errorMessage: 'Error: Docker run failed',
      },
    ),
  );

  process.chdir(currentDir);
  await execute(
    'Create tables...',
    async () => await spawnWithFindPattern('yarn', ['workspace', 'console-web-server', 'typeorm:schema'], /.*Schema synchronization finished successfully\..*/m),
  );
  await execute('Create migrations...', () => exec('yarn workspace console-web-server typeorm:fake'));
  await execute('Create seeds...', async () => {
    await PostgreSql.on(pgsqlConnectionOptions, async (context) => {
      await context.query('Create role bases...', `INSERT INTO project_role VALUES (1,'Admin',null,0,NOW(),NOW()), (2,'Write',null,0,NOW(),NOW()), (3,'Read',null,0,NOW(),NOW());`);
      await context.query(
        'Create role bases...',
        `INSERT INTO organization_role VALUES (1,null,'Owner', 0, NOW(),NOW(), null), (2,null,'Admin', 0,NOW(),NOW(), null), (3,null,'Member', 0,NOW(),NOW(), null);`,
      );
    });
  });

  console.log('Done');
  /**
   * @note force exit because kill the typeorm:schema process but does not exit
   */
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
