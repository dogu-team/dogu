import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { PackageJson } from './packagejson';
import { findRootWorkspace } from './workspace';

const fileNameIncludes = ['build', 'package.json', 'README.md', '.gitignore'];
const fileExtExcludes = ['.map', '.tsbuildinfo'];

export function newCleanEnv(): NodeJS.ProcessEnv {
  const newEnv: NodeJS.ProcessEnv = {};
  Object.keys(process.env).forEach((key) => {
    if (key.toLowerCase().startsWith('node_')) return;
    if (key.toLowerCase().startsWith('npm_')) return;
    if (key.toLowerCase().startsWith('nvm_')) return;
    newEnv[key] = process.env[key];
  });
  return newEnv;
}

function scanPackage(packagesPaths: string[], packageName: string): string {
  for (const packagesPath of packagesPaths) {
    const dirs = fs.readdirSync(packagesPath);
    for (const dir of dirs) {
      const packageJsonPath = path.resolve(packagesPath, dir, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        continue;
      }
      const packageJson = new PackageJson(packageJsonPath);
      if (packageJson.getName() === packageName) {
        return path.resolve(packagesPath, dir);
      }
    }
  }
  throw Error(`Package ${packageName} not found`);
}

export function handleShellString(shellString: shelljs.ShellString): void {
  if (shellString.stdout.length > 0) {
    console.log(shellString.stdout);
  }
  if (shellString.code !== 0) {
    throw new Error(shellString.stderr);
  }
}

function copyPacakge(srcPath: string, destPath: string): void {
  handleShellString(shelljs.rm('-rf', destPath));
  handleShellString(shelljs.mkdir('-p', destPath));
  const files = fs.readdirSync(srcPath).filter((file) => fileNameIncludes.includes(file));

  for (const file of files) {
    const sourcePath = path.resolve(srcPath, file);
    const targetPath = path.resolve(destPath, file);
    handleShellString(shelljs.cp('-fR', sourcePath, targetPath));
  }

  for (const extExclude of fileExtExcludes) {
    const targetFiles = shelljs.ls(`${destPath}/**/*${extExclude}`);
    handleShellString(shelljs.rm('-f', targetFiles));
  }
}

function copyDependentPackages(outputWorkspace: string, packageJson: PackageJson, packagesPaths: string[], outputPackagesPath: string): void {
  const deps = packageJson.getDependencies();
  for (const { name, value } of deps) {
    if (!value.startsWith('workspace:')) {
      continue;
    }

    const packagePath = scanPackage(packagesPaths, name);
    const packageName = name.replaceAll('/', '-');
    const destPath = path.resolve(outputPackagesPath, packageName);
    packageJson.setDependency(name, `file:${outputPackagesPath}/${packageName}`);
    if (fs.existsSync(destPath)) {
      continue;
    }
    copyPacakge(packagePath, destPath);

    const depPackageJson = new PackageJson(path.resolve(destPath, 'package.json'));
    copyDependentPackages(outputWorkspace, depPackageJson, packagesPaths, path.resolve(outputWorkspace, 'packages'));
  }

  const devdeps = packageJson.getDevDependencies();
  for (const { name, value } of devdeps) {
    if (!value.startsWith('workspace:')) {
      continue;
    }

    const packagePath = scanPackage(packagesPaths, name);
    const packageName = name.replaceAll('/', '-');
    const destPath = path.resolve(outputPackagesPath, packageName);
    packageJson.setDevDependency(name, `file:${outputPackagesPath}/${packageName}`);
    if (fs.existsSync(destPath)) {
      continue;
    }
    copyPacakge(packagePath, destPath);

    const depPackageJson = new PackageJson(path.resolve(destPath, 'package.json'));
    copyDependentPackages(outputWorkspace, depPackageJson, packagesPaths, path.resolve(outputWorkspace, 'packages'));
  }

  // packageJson.deleteDevDependencies();
  packageJson.write();
}

export async function execAndLog(command: string, args: string[]): Promise<void> {
  console.log(`$ ${command}`);
  const proc = childProcess.spawn(command, args, {
    shell: process.platform === 'win32' ? 'cmd.exe' : undefined,
    windowsVerbatimArguments: true,
    env: newCleanEnv(),
    cwd: process.cwd(),
    stdio: 'inherit',
  });

  return new Promise((resolve) => {
    proc.on('exit', () => {
      resolve();
    });
  });
}

export async function distNpmfyProject(projectName: string): Promise<string> {
  if (!projectName) {
    throw new Error('DOGU_PKG_PROJECT_PATH is not set');
  }
  const workspacePath = findRootWorkspace();
  const projectPath = path.resolve(workspacePath, 'projects', projectName);
  const packagesPaths = [
    path.resolve(workspacePath, 'packages', 'typescript'),
    path.resolve(workspacePath, 'packages', 'typescript-private'),
    path.resolve(workspacePath, 'packages', 'typescript-dev-private'),
    path.resolve(workspacePath, 'projects'),
  ];
  const outputWorkspace = path.resolve(projectPath, 'dist');

  copyPacakge(projectPath, outputWorkspace);

  const outputPackagesPath = path.resolve(outputWorkspace, 'packages');
  handleShellString(shelljs.rm('-rf', outputPackagesPath));
  handleShellString(shelljs.mkdir('-p', outputPackagesPath));

  const packageJson = new PackageJson(path.resolve(outputWorkspace, 'package.json'));
  copyDependentPackages(outputWorkspace, packageJson, packagesPaths, outputPackagesPath);

  shelljs.cd(outputWorkspace);

  await execAndLog(shelljs.which('npm')!.stdout, ['install']);

  return outputWorkspace;
}

export async function pkgProject(workspace: string): Promise<void> {
  if (!workspace) {
    throw new Error('workspace is not set');
  }

  process.chdir(workspace);
  const option = ''; // --debug

  const platform = process.platform;
  switch (platform) {
    case 'darwin':
      await execAndLog(shelljs.which('pkg')!.stdout, [workspace, option, '-t', 'node16-macos-x64,node16-macos-arm64']);
      break;
    case 'linux':
      await execAndLog(shelljs.which('pkg')!.stdout, [workspace, option, '-t', 'node16-linux-x64']);
      break;
    case 'win32':
      await execAndLog(shelljs.which('pkg')!.stdout, [workspace, option, '-t', 'node16-win-x64']);
      break;
  }
}
