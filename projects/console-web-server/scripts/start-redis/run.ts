import { node_package } from '@dogu-dev-private/build-tools';
import { exec, execute, which } from '../utils/utils';
import { config } from './config';

(async (): Promise<void> => {
  const workspaceDir = node_package.findRootWorkspace();
  process.chdir(workspaceDir);

  await execute('Checking Docker...', () => which('docker', { errorMessage: 'Error: Docker is not installed' }));
  await execute('Prune Docker...', () => exec('docker system prune -af --volumes', { errorMessage: 'Error: Docker prune failed' }));
  await execute('Pulling image...', () => exec(`docker pull ${config.imageName}`, { errorMessage: 'Error: Docker pull failed', retry: true }));
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
      `docker run \
      -d \
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
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
