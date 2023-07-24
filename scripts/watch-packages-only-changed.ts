import chalk from 'chalk';
import child_process from 'child_process';
import fs from 'fs';
import nodemon from 'nodemon';
import path from 'path';
import treeKill from 'tree-kill';
import util from 'util';

interface AnyDict {
  [key: string]: AnyDict | string | number;
}

interface PackageInfo {
  name: string;
  path: string;
  deps: AnyDict;
  devDeps: AnyDict;
}

interface PackageChanges {
  package: PackageInfo;
  files: string[];
}

interface BuildProc {
  package: PackageInfo;
  proc: child_process.ChildProcess;
}

const log = console.log;

const root = path.resolve(__dirname, '..');
const tsPackageRoots = [
  path.resolve(root, 'packages', 'typescript'),
  path.resolve(root, 'packages', 'typescript-private'),
  path.resolve(root, 'packages', 'typescript-dev-private'),
];
const packages: PackageInfo[] = [];
const watches: string[] = [];
const procs: BuildProc[] = [];

function listPackageInfos(): void {
  for (const tsPackageRoot of tsPackageRoots) {
    const dirs = fs.readdirSync(tsPackageRoot);
    for (const dir of dirs) {
      const packagePath = path.resolve(tsPackageRoot, dir);
      const packagejsonPath = path.resolve(tsPackageRoot, dir, 'package.json');
      const srcPath = path.resolve(tsPackageRoot, dir, 'src');
      if (!fs.existsSync(srcPath)) continue;
      const jsonDoc: AnyDict = JSON.parse(fs.readFileSync(packagejsonPath, 'utf8')) as AnyDict;
      const packageInfo = {
        name: jsonDoc['name'] as string,
        path: packagePath,
        deps: jsonDoc['dependencies'] as AnyDict,
        devDeps: jsonDoc['devDependencies'] as AnyDict,
      };
      if (packageInfo.deps) {
        Object.keys(packageInfo.deps).forEach((k) => (false == k.startsWith('@dogu') ? delete packageInfo.deps[k] : {}));
      }
      if (packageInfo.devDeps) {
        Object.keys(packageInfo.devDeps).forEach((k) => (false == k.startsWith('@dogu') ? delete packageInfo.devDeps[k] : {}));
      }
      packages.push(packageInfo);
      watches.push(srcPath);
    }
  }
}
listPackageInfos();

function findPackagepathFromTsFile(tsFile: string): PackageInfo | null {
  for (const p of packages) {
    if (tsFile.startsWith(path.resolve(p.path, 'src'))) {
      return p;
    }
  }
  return null;
}

function spawnPackageBuild(pf: PackageChanges, buildDesc = '[ Build ] '): BuildProc {
  const beforeProcs = procs.filter((p) => p.package.name === pf.package.name);
  for (const p of beforeProcs) {
    if (p.proc.pid) {
      treeKill(p.proc.pid, (error) => {
        if (error) {
          console.log('Error', error);
        } else {
          console.log(`Killed ${p.package.name} pid: ${p.proc.pid ?? 'undefined'}`);
        }
      });
    }
  }

  log(chalk.blue(`${buildDesc} ${pf.package.name}`));
  if (pf.files.length > 0) {
    log(chalk.white.dim(`> changed  ${util.inspect(pf.files)}`));
  }
  const startTime = Date.now();

  const proc = child_process.spawn('yarn', ['run', 'build'], { stdio: 'inherit', cwd: pf.package.path });

  const newBuildProc = { package: pf.package, proc };
  procs.push(newBuildProc);

  proc.on('exit', (code) => {
    const elapsed = Date.now() - startTime;
    if (code === 0) {
      log(chalk.green('[v] Build Complete', pf.package.name, code, `${elapsed}ms`));
    } else if (null == code || code === 129) {
      log(chalk.white.dim('[x] Maybe Process Killed', pf.package.name, code));
    } else {
      log(chalk.red('[x] Failed', pf.package.name, code));
    }
    procs.splice(procs.indexOf(newBuildProc), 1);
  });
  return newBuildProc;
}

function listupDeps(buildTargets: PackageInfo[], packageInfo: PackageInfo): PackageInfo[] {
  for (const p of packages) {
    const depAndDevDeps = { ...p.deps, ...p.devDeps } as AnyDict;
    for (const dep in depAndDevDeps) {
      if (dep !== packageInfo.name) continue;
      if (buildTargets.find((t) => t.name === p.name)) continue;

      buildTargets.push(p);
      // const deps = listupDeps(buildTargets, p);
    }
  }
  return buildTargets;
}

console.log('Watching packages:', packages);

nodemon({
  verbose: true,
  watch: watches,
  ext: 'ts',
  exec: 'echo ',
})
  .on('start', () => {
    console.log('\n');
  })
  .on('watching', (file) => {
    // noop
  })
  .on('quit', () => {
    console.log('quit');
  })
  .on('restart', (files: string[]) => {
    const packages: PackageChanges[] = [];
    for (const f of files) {
      const fPackage = findPackagepathFromTsFile(f);
      if (!fPackage) continue;

      let target = packages.find((p) => p.package.name === fPackage.name);
      if (!target) {
        target = { package: fPackage, files: [] };
        packages.push(target);
      }
      target.files.push(f);
    }
    for (const pf of packages) {
      const proc = spawnPackageBuild(pf);
      const deps = listupDeps([], pf.package);
      proc.proc.on('exit', (code) => {
        if (code === 0) {
          deps.forEach((p) => spawnPackageBuild({ package: p, files: [] }, '( Build Referencing Dependency )'));
        }
      });
    }
  });
