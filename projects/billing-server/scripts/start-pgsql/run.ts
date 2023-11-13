import { node_package } from '@dogu-dev-private/build-tools';
import { config } from '../../src/config';
import { checkDockerInstalled, clearDokerContainer, createDbSchema, createFakeDbMigrations, pullDockerImage } from '../common/common';
import { exec, execute } from '../utils/utils';

const containerName = 'dogu-billing-pgsql';
const imageName = 'postgres:15.3';

console.log('config', config);
console.log('ENV', config.runType);

const parsedUrl = new URL(config.db.billingUrl);

async function startDockerContainer() {
  await checkDockerInstalled();
  await execute('Starting container...', async () =>
    exec(
      `docker run -d \
      --name ${containerName} \
      -e POSTGRES_DB=${parsedUrl.pathname.replace('/', '')} \
      -e POSTGRES_USER=${parsedUrl.username} \
      -e POSTGRES_PASSWORD=${parsedUrl.password} \
      -e PGPORT=${parsedUrl.port} \
      -e TZ=Etc/UTC \
      -p ${parsedUrl.port}:${parsedUrl.port} \
      --restart always \
      ${imageName}`,
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
  await clearDokerContainer(containerName);
  await pullDockerImage(imageName);
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
