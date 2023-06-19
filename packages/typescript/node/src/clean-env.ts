export function newCleanNodeEnv(): NodeJS.ProcessEnv {
  const newEnv: NodeJS.ProcessEnv = {};
  Object.keys(process.env).forEach((key) => {
    if (key.toLowerCase().startsWith('node_')) return;
    if (key.toLowerCase().startsWith('npm_')) return;
    if (key.toLowerCase().startsWith('nvm_')) return;
    if (key.toLowerCase().startsWith('pnpm_')) return;
    newEnv[key] = process.env[key];
  });
  return newEnv;
}
