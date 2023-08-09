const allowdEnvKeys = ['NODE_EXTRA_CA_CERTS', 'NODE_TLS_REJECT_UNAUTHORIZED'];

export function newCleanNodeEnv(): NodeJS.ProcessEnv {
  const newEnv: NodeJS.ProcessEnv = {};
  Object.keys(process.env).forEach((key) => {
    if (allowdEnvKeys.includes(key.toUpperCase())) {
      newEnv[key] = process.env[key];
      return;
    }
    if (key.toLowerCase().startsWith('node_')) return;
    if (key.toLowerCase().startsWith('npm_')) return;
    if (key.toLowerCase().startsWith('nvm_')) return;
    if (key.toLowerCase().startsWith('pnpm_')) return;
    newEnv[key] = process.env[key];
  });
  return newEnv;
}
