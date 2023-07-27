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
    -p ${config.port}:${config.port} \
    -e DOCKER_INFLUXDB_INIT_MODE=setup \
    -e DOCKER_INFLUXDB_INIT_USERNAME=${config.userName} \
    -e DOCKER_INFLUXDB_INIT_PASSWORD=${config.password} \
    -e DOCKER_INFLUXDB_INIT_ORG=${config.org} \
    -e DOCKER_INFLUXDB_INIT_BUCKET=${config.bucket} \
    -e DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=${config.token} \
    -v ${config.volumeName}:/var/lib/influxdb2:rw \
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
  await clearVolume(config.volumeName);
  await createVolume(config.volumeName);
  await pullDockerImage(config.imageName);
  await startDockerContainer();

  console.log('Done');

  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
