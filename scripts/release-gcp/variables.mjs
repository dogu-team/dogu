import fs from 'fs';
import os from 'os';

const validRunTypes = ['development', 'production'];
const validProjectTypes = ['console-web-front', 'console-web-server', 'billing-server', 'dogu-redis', 'dogu-influxdb', 'dogu-coturn'];

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

  const DEV_DOCKER_PUBLISH_TAG = parseEnv('DEV_DOCKER_PUBLISH_TAG');
  const PROD_DOCKER_PUBLISH_TAG = parseEnv('PROD_DOCKER_PUBLISH_TAG');

  const GCP_DEV_CICD_SA_KEY = parseEnv('GCP_DEV_CICD_SA_KEY');
  const GCP_PROD_CICD_SA_KEY = parseEnv('GCP_PROD_CICD_SA_KEY');

  const GCP_DEV_PRIVATE_SSH_KEY = parseEnv('GCP_DEV_PRIVATE_SSH_KEY');
  const GCP_PROD_PRIVATE_SSH_KEY = parseEnv('GCP_PROD_PRIVATE_SSH_KEY');

  const DEV_DOGU_TURN_SERVER_HOST = parseEnv('DEV_DOGU_TURN_SERVER_HOST');
  const DEV_DOGU_TURN_SERVER_USERNAME = parseEnv('DEV_DOGU_TURN_SERVER_USERNAME');
  const DEV_DOGU_TURN_SERVER_PASSWORD = parseEnv('DEV_DOGU_TURN_SERVER_PASSWORD');
  const PROD_DOGU_TURN_SERVER_HOST = parseEnv('PROD_DOGU_TURN_SERVER_HOST');
  const PROD_DOGU_TURN_SERVER_USERNAME = parseEnv('PROD_DOGU_TURN_SERVER_USERNAME');
  const PROD_DOGU_TURN_SERVER_PASSWORD = parseEnv('PROD_DOGU_TURN_SERVER_PASSWORD');

  switch (DOGU_RUN_TYPE) {
    case 'development': {
      return {
        DOCKER_PUBLISH_TAG: DEV_DOCKER_PUBLISH_TAG,
        GCP_CICD_SA_KEY: GCP_DEV_CICD_SA_KEY,
        GCP_PRIVATE_SSH_KEY: GCP_DEV_PRIVATE_SSH_KEY,
        DOGU_TURN_SERVER_HOST: DEV_DOGU_TURN_SERVER_HOST,
        DOGU_TURN_SERVER_USERNAME: DEV_DOGU_TURN_SERVER_USERNAME,
        DOGU_TURN_SERVER_PASSWORD: DEV_DOGU_TURN_SERVER_PASSWORD,
      };
    }
    case 'production': {
      return {
        DOCKER_PUBLISH_TAG: PROD_DOCKER_PUBLISH_TAG,
        GCP_CICD_SA_KEY: GCP_PROD_CICD_SA_KEY,
        GCP_PRIVATE_SSH_KEY: GCP_PROD_PRIVATE_SSH_KEY,
        DOGU_TURN_SERVER_HOST: PROD_DOGU_TURN_SERVER_HOST,
        DOGU_TURN_SERVER_USERNAME: PROD_DOGU_TURN_SERVER_USERNAME,
        DOGU_TURN_SERVER_PASSWORD: PROD_DOGU_TURN_SERVER_PASSWORD,
      };
    }
    default: {
      throw new Error(`Unexpected run type: ${DOGU_RUN_TYPE}`);
    }
  }
}

function parseBy_DOGU_PROJECT_TYPE(options) {
  const { DOGU_PROJECT_TYPE, DOCKER_PUBLISH_TAG, DOGU_TURN_SERVER_HOST, DOGU_TURN_SERVER_USERNAME, DOGU_TURN_SERVER_PASSWORD } = options;

  switch (DOGU_PROJECT_TYPE) {
    case 'console-web-front': {
      const DOCKER_TAG = DOCKER_PUBLISH_TAG;
      return {
        DOCKER_RUN_COMMAND: `docker run -d --name console-web-front -p 3001:3001 --restart always ${DOCKER_TAG}`,
        NEED_PUBLISH: 'true',
        DOCKER_TAG,
      };
    }
    case 'console-web-server': {
      const DOCKER_TAG = DOCKER_PUBLISH_TAG;
      return {
        DOCKER_RUN_COMMAND: `docker run -d --name console-web-server -p 4000:4000 --restart always ${DOCKER_TAG}`,
        NEED_PUBLISH: 'true',
        DOCKER_TAG,
      };
    }
    case 'billing-server': {
      const DOCKER_TAG = DOCKER_PUBLISH_TAG;
      return {
        DOCKER_RUN_COMMAND: `docker run -d --name billing-server -p 4001:4001 --restart always ${DOCKER_TAG}`,
        NEED_PUBLISH: 'true',
        DOCKER_TAG,
      };
    }
    case 'dogu-redis': {
      const DOCKER_TAG = DOCKER_PUBLISH_TAG;
      return {
        DOCKER_RUN_COMMAND: `docker run -d --name dogu-redis -p 6379:6379 --restart always ${DOCKER_TAG}`,
        NEED_PUBLISH: 'true',
        DOCKER_TAG,
      };
    }
    case 'dogu-influxdb': {
      const DOCKER_TAG = DOCKER_PUBLISH_TAG;
      return {
        DOCKER_RUN_COMMAND: `docker run -d --name dogu-influxdb -p 8086:8086 --restart always ${DOCKER_TAG}`,
        NEED_PUBLISH: 'true',
        DOCKER_TAG,
      };
    }
    case 'dogu-coturn': {
      const DOCKER_TAG = 'coturn/coturn:4.5.2';
      const commands = [
        'docker',
        'run',
        '-d',
        '--name',
        'dogu-coturn',
        '-p',
        '3478:3478',
        '-p',
        '3478:3478/udp',
        '-p',
        '5349:5349',
        '-p',
        '5349:5349/udp',
        '-p',
        '49160-55000:49160-55000/udp',
        '--restart',
        'always',
        DOCKER_TAG,
        '--log-file=stdout',
        '--min-port=49160',
        '--max-port=55000',
        '--total-quota=100',
        `--user=${DOGU_TURN_SERVER_USERNAME}:${DOGU_TURN_SERVER_PASSWORD}`,
        `--realm=${DOGU_TURN_SERVER_HOST}`,
        '--listening-port=3478',
        '--tls-listening-port=5349',
        '--verbose',
        '--fingerprint',
        '--lt-cred-mech',
        '--stale-nonce',
        '--no-sslv3',
        '--no-tlsv1',
        '--no-multicast-peers',
        '--server-relay',
        '--listening-ip=0.0.0.0',
      ];
      return {
        DOCKER_RUN_COMMAND: commands.join(' '),
        NEED_PUBLISH: 'false',
        DOCKER_TAG,
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

  const { DOCKER_PUBLISH_TAG, GCP_CICD_SA_KEY, GCP_PRIVATE_SSH_KEY, DOGU_TURN_SERVER_HOST, DOGU_TURN_SERVER_USERNAME, DOGU_TURN_SERVER_PASSWORD } = parseBy_DOGU_RUN_TYPE({
    DOGU_RUN_TYPE,
  });
  const { DOCKER_RUN_COMMAND, NEED_PUBLISH, DOCKER_TAG } = parseBy_DOGU_PROJECT_TYPE({
    DOGU_PROJECT_TYPE,
    DOCKER_PUBLISH_TAG,
    DOGU_TURN_SERVER_HOST,
    DOGU_TURN_SERVER_USERNAME,
    DOGU_TURN_SERVER_PASSWORD,
  });

  fs.appendFileSync(GITHUB_OUTPUT, `GCP_CICD_SA_KEY<<EOF${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `${GCP_CICD_SA_KEY}${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `EOF${os.EOL}`);

  fs.appendFileSync(GITHUB_OUTPUT, `GCP_PRIVATE_SSH_KEY<<EOF${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `${GCP_PRIVATE_SSH_KEY}${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `EOF${os.EOL}`);

  fs.appendFileSync(GITHUB_OUTPUT, `DOCKER_TAG=${DOCKER_TAG}${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `DOCKER_RUN_COMMAND=${DOCKER_RUN_COMMAND}${os.EOL}`);
  fs.appendFileSync(GITHUB_OUTPUT, `NEED_PUBLISH=${NEED_PUBLISH}${os.EOL}`);
}

main();
