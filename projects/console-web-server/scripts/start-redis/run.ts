import { node_package } from '@dogu-dev-private/build-tools';
import fs from 'fs';
import path from 'path';
import { env } from '../../src/env';
import { access, exec, execute, which } from '../utils/utils';
import { config } from './config';

(async (): Promise<void> => {
  const workspaceDir = node_package.findRootWorkspace();
  process.chdir(workspaceDir);

  const redisConfigPath = path.resolve(workspaceDir, 'projects', 'console-web-server', 'scripts','start-redis', 'redis.conf');

  await execute('Checking File...', () => access(redisConfigPath, fs.constants.R_OK, { errorMessage: 'Error: redis.conf not found' }));
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
      `docker run -d --name ${config.containerName} -v ${redisConfigPath}:/usr/local/etc/redis/redis.conf -p ${config.port}:4100 -m 4g --restart always ${config.imageName} redis-server /usr/local/etc/redis/redis.conf`,
      {
        errorMessage: 'Error: Docker run failed',
      },
    ),
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
