import { node_package } from '@dogu-dev-private/build-tools';
import { checkDockerInstalled, clearDokerContainer, createDbSchema, createFakeDbMigrations, pullDockerImage } from '../common/common';
import { exec, execute } from '../utils/utils';
import { pgConfig } from './config';

async function startDockerContainer() {
  await checkDockerInstalled();
  await execute('Starting container...', async () =>
    exec(
      `docker run -d \
      --name ${pgConfig.containerName} \
      -e POSTGRES_DB=${pgConfig.schema} \
      -e POSTGRES_USER=${pgConfig.rootUser} \
      -e POSTGRES_PASSWORD=${pgConfig.rootPassword} \
      -e PGPORT=${pgConfig.port} \
      -e TZ=Etc/UTC \
      -p ${pgConfig.port}:${pgConfig.port} \
      --restart always \
      ${pgConfig.imageName}`,
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
  await clearDokerContainer(pgConfig.containerName);
  await pullDockerImage(pgConfig.imageName);
  await startDockerContainer();

  process.chdir(currentDir);
  await createDbSchema();
  await createFakeDbMigrations();
  console.log('Done');
  /**
   * @note force exit because kill the typeorm:schema process but does not exit
   */
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
