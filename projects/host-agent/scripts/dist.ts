import { node_package } from '@dogu-dev-private/build-tools';

void (async (): Promise<void> => {
  const workspace = await node_package.distNpmfyProject('host-agent');
  await node_package.pkgProject(workspace);
})();
