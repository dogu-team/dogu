import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function execute(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true });
    const onErrorForReject = (error: Error) => {
      reject(error);
    };
    child.on('error', onErrorForReject);
    child.on('spawn', () => {
      child.off('error', onErrorForReject);
      child.on('error', (error) => {
        console.error(error);
      });
    });
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" exited with code ${code} and signal ${signal}`));
      }
    });
  });
}

async function build(babelConfigPath: string, buildDir: string) {
  const sourceDir = 'src';
  const babelOutDir = path.resolve(buildDir, sourceDir);
  await execute('yarn', ['babel', '--config-file', babelConfigPath, '--extensions', '.ts', '--out-dir', babelOutDir, sourceDir]);
}

async function exportTypes(tsconfigPath: string) {
  await execute('yarn', ['tsc', '-p', tsconfigPath]);
}

async function writePackageJson(buildDir: string, packageType: string) {
  await fs.promises.writeFile(`${buildDir}/package.json`, JSON.stringify({ type: packageType }, null, 2));
}

interface Target {
  tsconfigPath?: string;
  babelConfigPath?: string;
  buildDir?: string;
  type?: string;
}

async function processTarget(target: Target) {
  if (target.tsconfigPath) {
    console.log(`Exporting types from ${target.tsconfigPath}`);
    await exportTypes(target.tsconfigPath);
  }
  if (target.babelConfigPath && target.buildDir) {
    console.log(`Building from ${target.babelConfigPath} to ${target.buildDir}`);
    await build(target.babelConfigPath, target.buildDir);
  }
  if (target.buildDir && target.type) {
    console.log(`Writing package.json with type ${target.type} to ${target.buildDir}`);
    await writePackageJson(target.buildDir, target.type);
  }
}

async function main() {
  const targets: Target[] = [
    {
      tsconfigPath: './configs/tsconfig.types.json',
    },
    {
      babelConfigPath: './configs/babel.config.cjs.mjs',
      buildDir: 'build/cjs',
      type: 'commonjs',
    },
    {
      babelConfigPath: './configs/babel.config.esm.mjs',
      buildDir: 'build/esm',
      type: 'module',
    },
  ];
  await Promise.all(targets.map((target) => processTarget(target)));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
