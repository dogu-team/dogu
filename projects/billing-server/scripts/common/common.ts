import {
  getDefaultMaxBrowserEnableCountByTier,
  getDefaultMaxMobileEnableCountByTier,
  LICENSE_SELF_HOSTED_TIER_TABLE_NAME,
  LICENSE_SELF_HOSTED_TIER_TYPE,
} from '@dogu-private/console';
import { retry } from '@dogu-tech/common';
import { ClientConfig } from 'pg';
import { PostgreSql } from '../utils/pgsql';
import { exec, execute, spawnWithFindPattern, which } from '../utils/utils';

export async function checkDockerInstalled(): Promise<void> {
  await execute('Checking Docker...', () => which('docker', { errorMessage: 'Error: Docker is not installed' }));
}

export async function pullDockerImage(imageName: string): Promise<void> {
  await checkDockerInstalled();
  await execute(`Pulling ${imageName} image...`, async () => exec(`docker pull ${imageName}`, { errorMessage: `Error: Docker image(${imageName}) pull failed`, retry: true }));
}

export async function createVolume(volumeName: string): Promise<void> {
  await checkDockerInstalled();
  await execute(`create volume(${volumeName}) dir...`, async () =>
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
      await execute('Removing volume...', async () => exec(`docker volume rm ${existsVolumeName}`, { errorMessage: 'Error: Docker volume rm failed' }));
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
      await execute('Removing container...', async () => exec(`docker rm -f ${containerId}`, { errorMessage: 'Error: Docker remove failed' }));
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
  await execute('Create migration table...', async () =>
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
        LICENSE_SELF_HOSTED_TIER_TYPE;
        const keys = Object.keys(LICENSE_SELF_HOSTED_TIER_TYPE).filter((key) => isNaN(Number(key)));

        for (const key of keys) {
          const value = LICENSE_SELF_HOSTED_TIER_TYPE[key as keyof typeof LICENSE_SELF_HOSTED_TIER_TYPE];

          const maxMobileEnableCount = getDefaultMaxMobileEnableCountByTier(value);
          const maxBrowserEnableCount = getDefaultMaxBrowserEnableCountByTier(value);
          const openApiEnabled = LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community ? false : true;
          const doguAgentAutoUpdateEnabled = LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community ? false : true;
          await context.query(
            'Create seed data...',
            `INSERT INTO ${LICENSE_SELF_HOSTED_TIER_TABLE_NAME} (name, enabled_mobile_count, enabled_browser_count, open_api_enabled, dogu_agent_auto_update_enabled ) VALUES ('${key}', ${maxMobileEnableCount}, ${maxBrowserEnableCount}, ${
              openApiEnabled ? 'true' : 'false'
            }, ${doguAgentAutoUpdateEnabled ? 'true' : 'false'});`,
          );
        }
      });
    },
    { retryCount: 3, retryInterval: 3000 },
  );
}
