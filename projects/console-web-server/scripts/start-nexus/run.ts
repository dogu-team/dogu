import { node_package } from '@dogu-dev-private/build-tools';
import { checkDockerInstalled, clearDokerContainer, clearVolume, createVolume, pullDockerImage } from '../common/common';
import { exec, execute } from '../utils/utils';
import { config } from './config';

async function startDockerContainer() {
  await checkDockerInstalled();
  await execute('Starting container...', () =>
    exec(
      `docker run -d \
      --name ${config.containerName} \
      --restart always \
      --ulimit nofile=65536:65536 \
      -p ${config.port}:${config.port} \
      -v ${config.volumeName}:/nexus-data \
      ${config.imageName}`,
      {
        errorMessage: 'Error: Docker run failed',
      },
    ),
  );
}

async function initNexus() {
  await execute('Create migrations...', () =>
    exec('yarn workspace nexus-initializer run start', {
      errorMessage: 'Error: nexus-initializer failed',
    }),
  );
}

(async (): Promise<void> => {
  const currentDir = process.cwd();
  const workspaceDir = node_package.findRootWorkspace();
  process.chdir(workspaceDir);

  await clearDokerContainer(config.containerName);
  await clearVolume(config.volumeName);
  await createVolume(config.volumeName);

  await pullDockerImage(config.imageName);
  await startDockerContainer();
  await initNexus();

  process.chdir(currentDir);

  console.log('Done');
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
