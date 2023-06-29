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

  await execute('delete volume...', async () => {
    const { stdout } = await exec(`docker volume ls --filter name=${config.volume} --format "{{.Name}}"`, { errorMessage: 'Error: Docker volume ls failed' });
    const volumeName = stdout.trim();
    if (volumeName) {
      console.log(`Volume found: ${volumeName}`);
      await execute('Removing volume...', () => exec(`docker volume rm ${volumeName}`, { errorMessage: 'Error: Docker volume rm failed' }));
    } else {
      console.log('Volume not found');
    }
  });

  await execute('create volume dir...', () =>
    exec(`docker volume create --name ${config.volume}`, {
      errorMessage: 'Error: Create volume failed',
    }),
  );

  await execute('Starting container...', () =>
    exec(`docker run -d --name ${config.containerName} --restart always --ulimit nofile=65536:65536 -p 8081:8081 -v ${config.volume}:/nexus-data ${config.image}`, {
      errorMessage: 'Error: Docker run failed',
    }),
  );

  process.chdir(currentDir);
  await execute('Create migrations...', () => exec('yarn workspace nexus-initializer run start'));

  console.log('Done');
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
