import { node_package } from '@dogu-dev-private/build-tools';
import { checkDockerInstalled, clearDokerContainer, pullDockerImage } from '../common/common';
import { exec, execute } from '../utils/utils';
import { config } from './config';

async function startDockerContainer() {
  await checkDockerInstalled();
  await execute('Starting container...', () =>
    exec(
      `docker run -d \
      --name ${config.containerName}  \
      --restart always \
      -p ${config.port}:${config.port} \
      ${config.imageName} \
      redis-server --requirepass ${config.password}
      `,
      {
        errorMessage: 'Error: Docker run failed',
      },
    ),
  );
}

(async (): Promise<void> => {
  const workspaceDir = node_package.findRootWorkspace();
  process.chdir(workspaceDir);

  await clearDokerContainer(config.containerName);
  await pullDockerImage(config.imageName);
  await startDockerContainer();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
