import { retry } from '@dogu-tech/common';
import { ClientConfig } from 'pg';
import { PostgreSql } from '../utils/pgsql';
import { exec, execute, spawnWithFindPattern, which } from '../utils/utils';

export async function checkDockerInstalled(): Promise<void> {
  await execute('Checking Docker...', () => which('docker', { errorMessage: 'Error: Docker is not installed' }));
}

export async function pullDockerImage(imageName: string): Promise<void> {
  await checkDockerInstalled();
  await execute(`Pulling ${imageName} image...`, () => exec(`docker pull ${imageName}`, { errorMessage: `Error: Docker image(${imageName}) pull failed`, retry: true }));
}

export async function createVolume(volumeName: string): Promise<void> {
  await checkDockerInstalled();
  await execute(`create volume(${volumeName}) dir...`, () =>
    exec(`docker volume create --name ${volumeName}`, {
      errorMessage: 'Error: Create volume failed',
    }),
  );
}

export async function clearVolume(volumeName: string) {
  await checkDockerInstalled();
  await execute('delete volume...', async () => {
    const { stdout } = await exec(`docker volume ls --filter name=${volumeName} --format "{{.Name}}"`, { errorMessage: 'Error: Docker volume ls failed' });
    const existsVolumeName = stdout.trim();
    if (existsVolumeName) {
      console.log(`Volume found: ${volumeName}`);
      await execute('Removing volume...', () => exec(`docker volume rm ${existsVolumeName}`, { errorMessage: 'Error: Docker volume rm failed' }));
    } else {
      console.log('Volume not found');
    }
  });
}

export async function clearDokerContainer(containerName: string): Promise<void> {
  await checkDockerInstalled();
  await execute('Stopping container...', async () => {
    const { stdout } = await exec(`docker ps -a --filter name=${containerName} --format "{{.ID}}"`, { errorMessage: 'Error: Docker ps failed' });
    const containerId = stdout.trim();
    if (containerId) {
      console.log(`Container found: ${containerId}`);
      await execute('Removing container...', () => exec(`docker rm -f ${containerId}`, { errorMessage: 'Error: Docker remove failed' }));
    } else {
      console.log('Container not found');
    }
  });
}

export async function createDbSchema(): Promise<void> {
  console.log('Create tables...');
  await retry(
    async () =>
      await spawnWithFindPattern(
        'yarn',
        ['run', 'typeorm:schema'], //
        /.*Schema synchronization finished successfully\..*/m,
      ),
    { retryCount: 3, retryInterval: 3000 },
  );
}

export async function createFakeDbMigrations(): Promise<void> {
  console.log('Create migrations...');
  await execute('Create migration table...', () =>
    exec(`yarn run typeorm:fake`, {
      errorMessage: 'Error: typeorm migration table generation failed',
      retry: true,
      retryCount: 3,
      retryInterval: 3000,
    }),
  );
}

export async function createSeedData(config: ClientConfig): Promise<void> {
  console.log('Create seeds...');
  await retry(
    async () => {
      await PostgreSql.on(config, async (context) => {
        await context.query(
          'Create role bases...',
          `INSERT INTO project_role VALUES (1,'Admin',null,0,NOW(),NOW()), (2,'Write',null,0,NOW(),NOW()), (3,'Read',null,0,NOW(),NOW());`,
        );
        await context.query(
          'Create role bases...',
          `INSERT INTO organization_role VALUES (1,null,'Owner', 0, NOW(),NOW(), null), (2,null,'Admin', 0,NOW(),NOW(), null), (3,null,'Member', 0,NOW(),NOW(), null);`,
        );
      });
    },
    { retryCount: 3, retryInterval: 3000 },
  );
}
