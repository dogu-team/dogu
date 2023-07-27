import { node_package } from '@dogu-dev-private/build-tools';
import { checkDockerInstalled, clearDokerContainer, createDbSchema, createFakeDbMigrations, createSeedData, pullDockerImage } from '../common/common';
import { exec, execute } from '../utils/utils';
import { config, pgsqlConnectionOptions } from './config';

async function startDockerContainer() {
  await checkDockerInstalled();
  await execute('Starting container...', () =>
    exec(
      `docker run -d \
      --name ${config.containerName} \
      -e POSTGRES_DB=${config.schema} \
      -e POSTGRES_USER=${config.rootUser} \
      -e POSTGRES_PASSWORD=${config.rootPassword} \
      -e PGPORT=${config.port} \
      -e TZ=Etc/UTC \
      -p ${config.port}:${config.port} \
      --restart always \
      ${config.imageName}`,
      {
        errorMessage: 'Error: Docker run failed',
      },
    ),
  );
}

(async (): Promise<void> => {
  const currentDir = process.cwd();
  const workspaceDir = node_package.findRootWorkspace();
  process.chdir(workspaceDir);
  await clearDokerContainer(config.containerName);
  await pullDockerImage(config.imageName);
  await startDockerContainer();

  process.chdir(currentDir);
  await createDbSchema();
  await createFakeDbMigrations();
  await createSeedData(pgsqlConnectionOptions);
  console.log('Done');
  /**
   * @note force exit because kill the typeorm:schema process but does not exit
   */
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
