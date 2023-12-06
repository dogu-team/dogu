import fs from 'fs';
import os from 'os';

function parseEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

const GITHUB_OUTPUT = parseEnv('GITHUB_OUTPUT');
if (!fs.existsSync(GITHUB_OUTPUT)) {
  fs.writeFileSync(GITHUB_OUTPUT, '');
}

const DEV_DOCKER_TAG = parseEnv('DEV_DOCKER_TAG');
const PROD_DOCKER_TAG = parseEnv('PROD_DOCKER_TAG');

const GCP_DEV_CICD_SA_KEY = parseEnv('GCP_DEV_CICD_SA_KEY');
const GCP_PROD_CICD_SA_KEY = parseEnv('GCP_PROD_CICD_SA_KEY');

const GCP_DEV_PRIVATE_SSH_KEY = parseEnv('GCP_DEV_PRIVATE_SSH_KEY');
const GCP_PROD_PRIVATE_SSH_KEY = parseEnv('GCP_PROD_PRIVATE_SSH_KEY');

const DOGU_RUN_TYPE = parseEnv('DOGU_RUN_TYPE');
const DOGU_PROJECT_TYPE = parseEnv('DOGU_PROJECT_TYPE');

const validRunTypes = ['development', 'production'];
const validProjectTypes = ['console-web-front'];

if (!validRunTypes.includes(DOGU_RUN_TYPE)) {
  throw new Error(`Invalid run type: ${DOGU_RUN_TYPE}`);
}

if (!validProjectTypes.includes(DOGU_PROJECT_TYPE)) {
  throw new Error(`Invalid project type: ${DOGU_PROJECT_TYPE}`);
}

switch (DOGU_RUN_TYPE) {
  case 'development': {
    fs.appendFileSync(GITHUB_OUTPUT, `GCP_SA_KEY<<EOF${os.EOL}`);
    fs.appendFileSync(GITHUB_OUTPUT, GCP_DEV_CICD_SA_KEY);
    fs.appendFileSync(GITHUB_OUTPUT, `${os.EOL}EOF${os.EOL}`);

    fs.appendFileSync(GITHUB_OUTPUT, `GCP_PRIVATE_SSH_KEY<<EOF${os.EOL}`);
    fs.appendFileSync(GITHUB_OUTPUT, GCP_DEV_PRIVATE_SSH_KEY);
    fs.appendFileSync(GITHUB_OUTPUT, `${os.EOL}EOF${os.EOL}`);

    fs.appendFileSync(GITHUB_OUTPUT, `DOCKER_TAG=${DEV_DOCKER_TAG}${os.EOL}`);
    break;
  }
  case 'production': {
    fs.appendFileSync(GITHUB_OUTPUT, `GCP_SA_KEY<<EOF${os.EOL}`);
    fs.appendFileSync(GITHUB_OUTPUT, GCP_PROD_CICD_SA_KEY);
    fs.appendFileSync(GITHUB_OUTPUT, `${os.EOL}EOF${os.EOL}`);

    fs.appendFileSync(GITHUB_OUTPUT, `GCP_PRIVATE_SSH_KEY<<EOF${os.EOL}`);
    fs.appendFileSync(GITHUB_OUTPUT, GCP_PROD_PRIVATE_SSH_KEY);
    fs.appendFileSync(GITHUB_OUTPUT, `${os.EOL}EOF${os.EOL}`);

    fs.appendFileSync(GITHUB_OUTPUT, `DOCKER_TAG=${PROD_DOCKER_TAG}${os.EOL}`);
    break;
  }
  default: {
    throw new Error(`Unexpected run type: ${DOGU_RUN_TYPE}`);
  }
}
