import fs from 'fs';
import os from 'os';

const args = process.argv.slice(2);
const command = args[0];

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

function command_parseInputs() {
  const GITHUB_OUTPUT = ensure_GITHUB_OUTPUT();

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
      fs.appendFileSync(GITHUB_OUTPUT, `GCP_SA_KEY_BASE64=${Buffer.from(GCP_DEV_CICD_SA_KEY).toString('base64')}${os.EOL}`);
      fs.appendFileSync(GITHUB_OUTPUT, `GCP_PRIVATE_SSH_KEY_BASE64=${Buffer.from(GCP_DEV_PRIVATE_SSH_KEY).toString('base64')}${os.EOL}`);
      fs.appendFileSync(GITHUB_OUTPUT, `DOCKER_TAG_BASE64=${Buffer.from(DEV_DOCKER_TAG).toString('base64')}${os.EOL}`);
      break;
    }
    case 'production': {
      fs.appendFileSync(GITHUB_OUTPUT, `GCP_SA_KEY_BASE64=${Buffer.from(GCP_PROD_CICD_SA_KEY).toString('base64')}${os.EOL}`);
      fs.appendFileSync(GITHUB_OUTPUT, `GCP_PRIVATE_SSH_KEY_BASE64=${Buffer.from(GCP_PROD_PRIVATE_SSH_KEY).toString('base64')}${os.EOL}`);
      fs.appendFileSync(GITHUB_OUTPUT, `DOCKER_TAG_BASE64=${Buffer.from(PROD_DOCKER_TAG).toString('base64')}${os.EOL}`);
      break;
    }
    default: {
      throw new Error(`Unexpected run type: ${DOGU_RUN_TYPE}`);
    }
  }

  fs.writeFileSync(`${os.homedir()}/parse-inputs.txt`, fs.readFileSync(GITHUB_OUTPUT));
}

function command_parseVariables() {
  const GITHUB_OUTPUT = ensure_GITHUB_OUTPUT();

  const GCP_SA_KEY_BASE64 = parseEnv('GCP_SA_KEY_BASE64');
  const GCP_PRIVATE_SSH_KEY_BASE64 = parseEnv('GCP_PRIVATE_SSH_KEY_BASE64');
  const DOCKER_TAG_BASE64 = parseEnv('DOCKER_TAG_BASE64');

  fs.appendFileSync(GITHUB_OUTPUT, `GCP_SA_KEY=${Buffer.from(GCP_SA_KEY_BASE64, 'base64').toString('utf-8')}${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `GCP_PRIVATE_SSH_KEY=${Buffer.from(GCP_PRIVATE_SSH_KEY_BASE64, 'base64').toString('utf-8')}${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `DOCKER_TAG=${Buffer.from(DOCKER_TAG_BASE64, 'base64').toString('utf-8')}${os.EOL}`);
}

switch (command) {
  case 'parse-inputs': {
    command_parseInputs();
    break;
  }
  case 'parse-variables': {
    command_parseVariables();
    break;
  }
  default: {
    throw new Error(`Unexpected command: ${command}`);
  }
}
