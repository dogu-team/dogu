import { node_package } from '@dogu-dev-private/build-tools';
import { checkDockerInstalled, clearDokerContainer, pullDockerImage } from '../common/common';
import { exec, execute } from '../utils/utils';
import { config } from './config';

async function startDockerContainer() {
  await checkDockerInstalled();
  await execute('Starting container...', () =>
    exec(
      `docker run -d \
      --name ${config.containerName} \
      --restart always \
      -p ${config.port}:${config.port}/tcp \
      -p ${config.port}:${config.port}/udp \
      -p 5349:5349/tcp \
      -p 5349:5349/udp \
      -p 49160-49170:49160-49170/udp \
      ${config.imageName} \
      --log-file=stdout \
      --min-port=49160 \
      --max-port=55000 \
      --total-quota=100 \
      --user="${config.userName}:${config.password}" \
      --realm="${config.realm}" \
      --listening-port=${config.port} \
      --tls-listening-port=5349 \
      --verbose \
      --fingerprint \
      --lt-cred-mech \
      --stale-nonce \
      --no-sslv3 \
      --no-tlsv1 \
      --no-multicast-peers \
      --server-relay \
      --listening-ip=0.0.0.0`,
      {
        errorMessage: 'Error: Docker run failed',
      },
    ),
  );
}

(async (): Promise<void> => {
  const currentDir = process.cwd();
  const workspaceDir = node_package.findRootWorkspace();
  process.chdir(workspaceDir);

  await clearDokerContainer(config.containerName);
  await pullDockerImage(config.imageName);
  await startDockerContainer();

  console.log('Done');

  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
