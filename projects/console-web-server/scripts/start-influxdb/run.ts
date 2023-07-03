import { node_package } from '@dogu-dev-private/build-tools';
import { exec, execute, which } from '../utils/utils';
import { config } from './config';

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
      `docker run -d \
      --name dogu-influxdb \
      --restart always \
      -p 8086:8086 \
      -e DOCKER_INFLUXDB_INIT_MODE=setup \
      -e DOCKER_INFLUXDB_INIT_USERNAME=${config.userName} \
      -e DOCKER_INFLUXDB_INIT_PASSWORD=${config.password} \
      -e DOCKER_INFLUXDB_INIT_ORG=${config.org} \
      -e DOCKER_INFLUXDB_INIT_BUCKET=${config.bucket} \
      -e DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=${config.token} \
      influxdb:2.6.1`,
      {
        errorMessage: 'Error: Docker run failed',
      },
    ),
  );

  console.log('Done');
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
