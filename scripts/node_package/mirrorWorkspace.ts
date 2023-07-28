import chalk from 'chalk';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { findRootWorkspace } from '../workspace';
import { PackageJson } from './packagejson';

interface Watch {
  src: string;
  dest: string;
  bidirectional?: boolean;
}

interface WatchOption {
  copyOnly?: boolean;
  excludeDirs?: string[];
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

function copyPacakgeJson(srcPath: string, destPath: string, returningWatchs: Watch[]): void {
  fs.rmSync(destPath, { recursive: true, force: true });
  fs.mkdirSync(destPath, { recursive: true });
  fs.copyFileSync(path.resolve(srcPath, 'package.json'), path.resolve(destPath, 'package.json'));
  returningWatchs.push({
    src: path.resolve(srcPath, 'build'),
    dest: path.resolve(destPath, 'build'),
  });
  returningWatchs.push({
    src: path.resolve(srcPath, 'src'),
    dest: path.resolve(destPath, 'src'),
    bidirectional: true,
  });
  returningWatchs.push({
    src: path.resolve(srcPath, 'tsconfig.json'),
    dest: path.resolve(destPath, 'tsconfig.json'),
  });
  returningWatchs.push({
    src: path.resolve(srcPath, 'package.json'),
    dest: path.resolve(destPath, 'package.json'),
  });
}

function copyDependentPackages(outputWorkspace: string, packageJson: PackageJson, packagesPaths: string[], outputPackagesPath: string, returningWatchs: Watch[]): void {
  const deps = [...packageJson.getDependencies(), ...packageJson.getDevDependencies()];
  for (const { name, value } of deps) {
    if (!value.startsWith('workspace:')) {
      continue;
    }

    const packagePath = scanPackage(packagesPaths, name);
    const packageName = name.replaceAll('/', '-');
    const destPath = path.resolve(outputPackagesPath, packageName);
    // packageJson.setDependency(name, `file:${outputPackagesPath}/${packageName}`);
    if (fs.existsSync(destPath)) {
      continue;
    }
    copyPacakgeJson(packagePath, destPath, returningWatchs);

    const depPackageJson = new PackageJson(path.resolve(destPath, 'package.json'));
    copyDependentPackages(outputWorkspace, depPackageJson, packagesPaths, path.resolve(outputWorkspace, 'packages'), returningWatchs);
  }

  // const devdeps = packageJson.getDevDependencies();
  // for (const { name, value } of devdeps) {
  //   if (!value.startsWith('workspace:')) {
  //     continue;
  //   }

  //   const packagePath = scanPackage(packagesPaths, name);
  //   const packageName = name.replaceAll('/', '-');
  //   const destPath = path.resolve(outputPackagesPath, packageName);
  //   packageJson.setDevDependency(name, `file:${outputPackagesPath}/${packageName}`);
  //   if (fs.existsSync(destPath)) {
  //     continue;
  //   }
  //   copyPacakgeJson(packagePath, destPath, returningWatchs);

  //   const depPackageJson = new PackageJson(path.resolve(destPath, 'package.json'));
  //   copyDependentPackages(outputWorkspace, depPackageJson, packagesPaths, path.resolve(outputWorkspace, 'packages'), returningWatchs);
  // }

  packageJson.write();
}

function copyIfDiff(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    return;
  }
  const srcSize = fs.statSync(src).size;
  const destSize = fs.statSync(dest).size;

  if (srcSize !== destSize) {
    fs.copyFileSync(src, dest);
  }
}

export async function mirrorWorkspace(spacePath: string, option: WatchOption = { copyOnly: false }): Promise<string> {
  const workspacePath = findRootWorkspace();
  const packagesPaths = [
    path.resolve(workspacePath, 'packages', 'typescript'),
    path.resolve(workspacePath, 'packages', 'typescript-private'),
    path.resolve(workspacePath, 'packages', 'typescript-dev-private'),
  ];
  const outputWorkspace = path.resolve(spacePath, 'mirror');

  const outputPackagesPath = path.resolve(outputWorkspace, 'packages');
  handleShellString(shelljs.rm('-rf', outputPackagesPath));
  handleShellString(shelljs.mkdir('-p', outputPackagesPath));

  const excludeDirs = option.excludeDirs ?? [];
  const returningWatchs: Watch[] = [];
  for (const tsPackageRoot of packagesPaths) {
    const dirs = fs.readdirSync(tsPackageRoot);
    for (const dir of dirs) {
      const srcPackagePath = path.resolve(tsPackageRoot, dir);
      if (excludeDirs.some((excludeDir) => srcPackagePath.includes(excludeDir))) {
        console.log(chalk.redBright(`[mirror] exclude: ${srcPackagePath}`));
        continue;
      }

      const srcPath = path.resolve(tsPackageRoot, dir, 'src');
      if (!fs.existsSync(srcPath)) continue;

      const srcPackageJson = new PackageJson(path.resolve(tsPackageRoot, dir, 'package.json'));

      const packageName = srcPackageJson.getName().replaceAll('/', '-');
      const destPackagePath = path.resolve(outputPackagesPath, packageName);
      copyPacakgeJson(srcPackagePath, destPackagePath, returningWatchs);

      const packageJson = new PackageJson(path.resolve(destPackagePath, 'package.json'));
      copyDependentPackages(outputWorkspace, packageJson, packagesPaths, outputPackagesPath, returningWatchs);
    }
  }

  if (option.copyOnly) {
    returningWatchs.forEach(({ src, dest }) => {
      console.log(chalk.yellowBright(`[mirror copy] from: ${src}`));
      console.log(chalk.yellowBright(`              to:   ${dest}\n`));
      shelljs.rm('-rf', dest);
      shelljs.cp('-rf', src, dest);
    });
    return outputWorkspace;
  }

  const watchers = returningWatchs.map(({ src, dest, bidirectional }) => {
    console.log(chalk.yellowBright(`[mirror] from: ${src}`));
    console.log(chalk.yellowBright(`         to:   ${dest}\n`));
    const watcher = chokidar.watch(src);
    watcher.on('all', (event, path_) => {
      const destPath = path.resolve(dest, path.relative(src, path_));
      const date = new Date();
      console.log(chalk.greenBright(`[mirror] ${date.toISOString()} | ${event}`));
      console.log(chalk.greenBright(`         from: ${path_}`));
      console.log(chalk.greenBright(`         to:   ${destPath}\n`));
      try {
        if (event === 'addDir') {
          fs.mkdirSync(destPath, { recursive: true });
        } else if (event === 'unlinkDir') {
          fs.rmSync(destPath, { recursive: true, force: true });
        } else if (event === 'add') {
          copyIfDiff(path_, destPath);
        } else if (event === 'change') {
          copyIfDiff(path_, destPath);
        } else if (event === 'unlink') {
          fs.unlinkSync(destPath);
        } else {
          throw new Error(`[mirror] unknown event: ${event}, path: ${path_}, destPath: ${destPath}`);
        }
      } catch (error) {
        console.error(`[mirror] ${error}`);
      }
    });
    if (bidirectional) {
      const watcher = chokidar.watch(dest, { useFsEvents: true });
      watcher.on('change', (path_, stat) => {
        const srcPath = path.resolve(src, path.relative(dest, path_));
        const date = new Date();
        console.log(chalk.yellowBright(`[reverse mirror] ${date.toISOString()}`));
        console.log(chalk.yellowBright(`         from: ${path_}`));
        console.log(chalk.yellowBright(`         to:   ${srcPath}\n`));
        try {
          copyIfDiff(path_, srcPath);
        } catch (error) {
          console.error(`[reverse mirror] ${error}`);
        }
      });
    }
    return watcher;
  });

  shelljs.cd(outputWorkspace);
  return outputWorkspace;
}
