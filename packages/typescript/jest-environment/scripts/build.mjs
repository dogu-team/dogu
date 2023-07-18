import { spawn } from 'child_process';
import fs from 'fs';
import fg from 'fast-glob';
import path from 'path';

async function exec(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}`));
      }
    });
  });
}

async function build(babelConfigPath, outDir) {
  await exec('yarn', ['babel', '--config-file', babelConfigPath, '--extensions', '.ts', '--out-dir', outDir, 'src']);
}

async function exportTypes(tsconfigPath) {
  await exec('yarn', ['tsc', '-p', tsconfigPath]);
}

async function writePackageJson(dirPath, packageType) {
  await fs.promises.writeFile(`${dirPath}/package.json`, JSON.stringify({ type: packageType }, null, 2));
}

async function copyJsonFiles(packageJsonOutDir) {
  const jsonFiles = await fg(`src/**/*.json`);
  await Promise.all(
    jsonFiles.map(async (jsonFile) => {
      return fs.promises.cp(`${jsonFile}`, path.resolve(packageJsonOutDir, jsonFile));
    }),
  );
}

async function main() {
  const targets = [
    {
      babelConfigPath: './babel.config.cjs.json',
      babelOutDir: 'build/cjs/src',
      type: 'commonjs',
      packageJsonOutDir: 'build/cjs',
      tsconfigPath: './tsconfig.cjs.json',
    },
    {
      babelConfigPath: './babel.config.esm.json',
      babelOutDir: 'build/esm/src',
      type: 'module',
      packageJsonOutDir: 'build/esm',
      tsconfigPath: './tsconfig.esm.json',
    },
  ];
  await Promise.all(targets.map((target) => build(target.babelConfigPath, target.babelOutDir)));
  await Promise.all(targets.map((target) => writePackageJson(target.packageJsonOutDir, target.type)));
  await Promise.all(targets.map((target) => exportTypes(target.tsconfigPath)));
  await Promise.all(targets.map((target) => copyJsonFiles(target.packageJsonOutDir)));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
