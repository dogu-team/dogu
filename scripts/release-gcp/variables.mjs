import fs from 'fs';
import os from 'os';

const validRunTypes = ['development', 'production'];
const validProjectTypes = ['console-web-front', 'console-web-server', 'billing-server', 'dogu-redis', 'dogu-inflluxdb', 'dogu-coturn'];

function parseEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

function ensure_GITHUB_OUTPUT() {
  const GITHUB_OUTPUT = parseEnv('GITHUB_OUTPUT');
  if (!fs.existsSync(GITHUB_OUTPUT)) {
    fs.writeFileSync(GITHUB_OUTPUT, '');
  }
  return GITHUB_OUTPUT;
}

function parseBy_DOGU_RUN_TYPE(options) {
  const { DOGU_RUN_TYPE } = options;

  const DEV_DOCKER_TAG = parseEnv('DEV_DOCKER_TAG');
  const PROD_DOCKER_TAG = parseEnv('PROD_DOCKER_TAG');

  const GCP_DEV_CICD_SA_KEY = parseEnv('GCP_DEV_CICD_SA_KEY');
  const GCP_PROD_CICD_SA_KEY = parseEnv('GCP_PROD_CICD_SA_KEY');

  const GCP_DEV_PRIVATE_SSH_KEY = parseEnv('GCP_DEV_PRIVATE_SSH_KEY');
  const GCP_PROD_PRIVATE_SSH_KEY = parseEnv('GCP_PROD_PRIVATE_SSH_KEY');

  switch (DOGU_RUN_TYPE) {
    case 'development': {
      return {
        DOCKER_TAG: DEV_DOCKER_TAG,
        GCP_CICD_SA_KEY: GCP_DEV_CICD_SA_KEY,
        GCP_PRIVATE_SSH_KEY: GCP_DEV_PRIVATE_SSH_KEY,
      };
    }
    case 'production': {
      return {
        DOCKER_TAG: PROD_DOCKER_TAG,
        GCP_CICD_SA_KEY: GCP_PROD_CICD_SA_KEY,
        GCP_PRIVATE_SSH_KEY: GCP_PROD_PRIVATE_SSH_KEY,
      };
    }
    default: {
      throw new Error(`Unexpected run type: ${DOGU_RUN_TYPE}`);
    }
  }
}

function parseBy_DOGU_PROJECT_TYPE(options) {
  const { DOGU_PROJECT_TYPE, DOCKER_TAG } = options;

  switch (DOGU_PROJECT_TYPE) {
    case 'console-web-front': {
      return {
        DOCKER_RUN_COMMAND: `docker run -d --name console-web-front -p 3001:3001 --restart always ${DOCKER_TAG}`,
      };
    }
    case 'console-web-server': {
      return {
        DOCKER_RUN_COMMAND: `docker run -d --name console-web-server -p 4000:4000 --restart always ${DOCKER_TAG}`,
      };
    }
    case 'billing-server': {
      return {
        DOCKER_RUN_COMMAND: `docker run -d --name billing-server -p 4001:4001 --restart always ${DOCKER_TAG}`,
      };
    }
    case 'dogu-redis': {
      return {
        DOCKER_RUN_COMMAND: `docker run -d --name dogu-redis -p 6379:6379 --restart always ${DOCKER_TAG}`,
      };
    }
    case 'dogu-influxdb': {
      return {
        DOCKER_RUN_COMMAND: `docker run -d --name dogu-influxdb -p 8086:8086 --restart always ${DOCKER_TAG}`,
      };
    }
    case 'dogu-coturn': {
      return {
        DOCKER_RUN_COMMAND: `docker run -d --name dogu-coturn -p 3478:3478 --restart always ${DOCKER_TAG}`,
      };
    }
    default: {
      throw new Error(`Unexpected project type: ${DOGU_PROJECT_TYPE}`);
    }
  }
}

function main() {
  const GITHUB_OUTPUT = ensure_GITHUB_OUTPUT();

  const DOGU_RUN_TYPE = parseEnv('DOGU_RUN_TYPE');
  if (!validRunTypes.includes(DOGU_RUN_TYPE)) {
    throw new Error(`Invalid run type: ${DOGU_RUN_TYPE}`);
  }

  const DOGU_PROJECT_TYPE = parseEnv('DOGU_PROJECT_TYPE');
  if (!validProjectTypes.includes(DOGU_PROJECT_TYPE)) {
    throw new Error(`Invalid project type: ${DOGU_PROJECT_TYPE}`);
  }

  const { DOCKER_TAG, GCP_CICD_SA_KEY, GCP_PRIVATE_SSH_KEY } = parseBy_DOGU_RUN_TYPE({ DOGU_RUN_TYPE });
  fs.appendFileSync(GITHUB_OUTPUT, `GCP_CICD_SA_KEY<<EOF${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `${GCP_CICD_SA_KEY}${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `EOF${os.EOL}`);

  fs.appendFileSync(GITHUB_OUTPUT, `GCP_PRIVATE_SSH_KEY<<EOF${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `${GCP_PRIVATE_SSH_KEY}${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `EOF${os.EOL}`);

  fs.appendFileSync(GITHUB_OUTPUT, `DOCKER_TAG=${DOCKER_TAG}${os.EOL}`);

  const { DOCKER_RUN_COMMAND } = parseBy_DOGU_PROJECT_TYPE({ DOGU_PROJECT_TYPE, DOCKER_TAG });
  fs.appendFileSync(GITHUB_OUTPUT, `DOCKER_RUN_COMMAND=${DOCKER_RUN_COMMAND}${os.EOL}`);
}

main();
