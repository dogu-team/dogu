import axios, { isAxiosError } from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
if (!process.env.DOGU_NEXUS_USERNAME) throw new Error('DefaultAdminUsername is not defined');
if (!process.env.DOGU_NEXUS_PASSWORD) throw new Error('DefaultAdminPassword is not defined');

const ContainerName = process.env.DOGU_NEXUS_CONTAINER_NAME || 'dogu-nexus';
const Url = process.env.DOGU_NEXUS_URL || 'http://dogu-nexus:8081';

const DefaultAdminUsername = process.env.DOGU_NEXUS_USERNAME;
const DefaultAdminPassword = process.env.DOGU_NEXUS_PASSWORD;

const CheckStartTimeout = 10 * 60 * 1000;
const CheckStartInterval = 10 * 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function simplifyAxiosError(error: any): Error {
  if (isAxiosError(error)) {
    return new Error(
      JSON.stringify({
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        },
      }),
    );
  }
  return error instanceof Error ? error : new Error(JSON.stringify(error));
}

async function checkDockerCli(): Promise<void> {
  console.log('Checking docker cli...');
  const { stdout, stderr } = await execAsync('docker --version');
  if (stderr) {
    console.error(stderr);
    process.exit(1);
  }
  console.log(stdout);
}

async function checkServerStarted(): Promise<void> {
  console.log('Checking server started...');
  let lastError: Error | null = null;
  const checkTimeout = setTimeout(() => {
    console.error(`Timeout: Server did not start within ${CheckStartTimeout} ms`);
    if (lastError) {
      console.error('Last error:', lastError);
    }
    process.exit(1);
  }, CheckStartTimeout);
  while (true) {
    try {
      await axios.get(Url).catch((error) => {
        throw simplifyAxiosError(error);
      });
      console.log('Server started');
      clearTimeout(checkTimeout);
      return;
    } catch (error) {
      console.log('Server did not start yet. retry...', error);
      lastError = error instanceof Error ? error : new Error(JSON.stringify(error));
      await delay(CheckStartInterval);
    }
  }
}

async function checkAdminPasswordFile(): Promise<boolean> {
  console.log('Checking admin.password file...');
  try {
    await execAsync(`docker exec ${ContainerName} /bin/bash -c "test -e /nexus-data/admin.password"`);
    console.log('admin.password file exists');
    return true;
  } catch (error) {
    console.log(error);
    console.log('admin.password file does not exist. Initialization is not required');
    return false;
  }
}

async function readAdminPassword(): Promise<string> {
  console.log('Reading admin.password...');
  const { stdout, stderr } = await execAsync(`docker exec ${ContainerName} /bin/bash -c "cat /nexus-data/admin.password"`);
  if (stderr) {
    console.error(stderr);
    process.exit(1);
  }
  const adminPassword = stdout.trim();
  console.log('admin.password:', adminPassword);
  return adminPassword;
}

async function updateAdminPassword(adminPassword: string): Promise<void> {
  console.log('Updating admin password...');
  const response = await axios
    .put(`${Url}/service/rest/v1/security/users/admin/change-password`, DefaultAdminPassword, {
      headers: {
        'Content-Type': 'text/plain',
      },
      auth: {
        username: DefaultAdminUsername,
        password: adminPassword,
      },
    })
    .catch((error) => {
      throw simplifyAxiosError(error);
    });
  console.log('Response:', response.status, response.statusText);
}

async function updateAnonymousAccess(): Promise<void> {
  console.log('Updating anonymous access...');
  const response = await axios.put(
    `${Url}/service/rest/v1/security/anonymous`,
    {
      enabled: true,
      userId: 'anonymous',
      realmName: 'NexusAuthorizingRealm',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: DefaultAdminUsername,
        password: DefaultAdminPassword,
      },
    },
  );
  console.log('Response:', response.status, response.statusText);
}

async function createRawRepository(name: string): Promise<void> {
  console.log('Creating raw repository...');
  const response = await axios
    .post(
      `${Url}/service/rest/v1/repositories/raw/hosted`,
      {
        name,
        online: true,
        storage: {
          blobStoreName: 'default',
          strictContentTypeValidation: true,
          writePolicy: 'ALLOW',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: 'admin',
          password: DefaultAdminPassword,
        },
      },
    )
    .catch((error) => {
      throw simplifyAxiosError(error);
    });
  console.log('Response:', response.status, response.statusText);
}

async function initialize(): Promise<void> {
  console.log('Initializing Nexus with', { Url, DefaultAdminUsername, DefaultAdminPassword, CheckStartTimeout, CheckStartInterval });
  await checkDockerCli();
  await checkServerStarted();
  const isAdminPasswordFileExist = await checkAdminPasswordFile();
  if (!isAdminPasswordFileExist) {
    return;
  }
  const adminPassword = await readAdminPassword();
  await updateAdminPassword(adminPassword);
  await updateAnonymousAccess();
  await createRawRepository('user');
  await createRawRepository('organization');
  await createRawRepository('public');
}

await initialize();
