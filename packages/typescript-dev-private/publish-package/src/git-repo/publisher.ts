import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { simpleGit, SimpleGit } from 'simple-git';
import { findRootWorkspace } from '..';
import { PartialPackageJson } from '../types';
import { PackageGithubMap } from './map';

export abstract class GitRepoPublisher {
  private readonly git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  getTempDir(): string {
    return '.publish-github';
  }

  abstract publish(): Promise<void>;
  abstract copy(): Promise<void>;

  protected skipIfNotExist(packageName: string): boolean {
    const info = PackageGithubMap[packageName];
    if (!info) {
      console.log(`package ${packageName} not found in package map, skip`);
      return true;
    }
    return false;
  }

  protected clone(packageName: string, runType: string, branchOrTag: string): string {
    const info = PackageGithubMap[packageName];
    if (!info) {
      throw new Error(`package ${packageName} not found in package map`);
    }
    const url = info[runType];
    console.log(`clone ${url}`);
    if (!url) {
      throw new Error(`url not found for package ${packageName} and branch or tag ${branchOrTag}`);
    }
    if (shelljs.exec(`git clone --depth 1 --branch ${branchOrTag} ${url} ${this.getTempDir()}`).code !== 0) {
      throw new Error(`git clone ${url} failed`);
    }
    return url;
  }

  protected deleteContents(): void {
    console.log('delete contents');
    const cwd = process.cwd();
    try {
      process.chdir(this.getTempDir());
      if (shelljs.exec('rm -rf ./*').code !== 0) {
        throw new Error('delete contents failed');
      }
    } finally {
      process.chdir(cwd);
    }
  }

  protected async modifyPackageJson(npmTag: string): Promise<void> {
    console.log('modify package.json');
    const filePath = `${this.getTempDir()}/package.json`;
    const content = await fs.promises.readFile(filePath, 'utf8');
    const packageJson = JSON.parse(content) as PartialPackageJson;
    const { dependencies, devDependencies } = packageJson;
    const parentQueue: string[] = [];
    if (dependencies) {
      Object.keys(dependencies)
        .map((packageName) => {
          return { packageName, version: dependencies[packageName] };
        })
        .filter(({ version }) => version.startsWith('workspace:'))
        .forEach(({ packageName }) => {
          dependencies[packageName] = npmTag;
          parentQueue.push(packageName);
        });

      const rootWorkspacePath = findRootWorkspace();
      while (parentQueue.length > 0) {
        const parent = parentQueue.shift();
        if (parent === undefined) {
          throw new Error('parent is undefined');
        }
        const match = /^@dogu-tech\/(.+)$/g.exec(parent);
        if (!match) {
          continue;
        }
        const parentPackageName = match[1];
        const parentPackageJsonPath = path.resolve(rootWorkspacePath, 'packages', 'typescript', parentPackageName, 'package.json');
        const stat = await fs.promises.stat(parentPackageJsonPath).catch(() => null);
        if (!stat) {
          throw new Error(`package ${parentPackageName} not found. path: ${parentPackageJsonPath}`);
        }
        const content = await fs.promises.readFile(parentPackageJsonPath, 'utf8');
        const parentPackageJson = JSON.parse(content) as PartialPackageJson;
        const { dependencies: parentDependencies, devDependencies } = parentPackageJson;
        if (parentDependencies) {
          Object.keys(parentDependencies)
            .map((packageName) => {
              return { packageName, version: parentDependencies[packageName] };
            })
            .filter(({ version }) => version.startsWith('workspace:'))
            .forEach(({ packageName }) => {
              parentQueue.push(packageName);
            });
        }
        if (Reflect.get(dependencies, parent)) {
          continue;
        }
        dependencies[parent] = npmTag;
      }
    }

    if (devDependencies) {
      Object.keys(devDependencies)
        .map((packageName) => {
          return { packageName, version: devDependencies[packageName] };
        })
        .filter(({ version }) => version.startsWith('workspace:'))
        .forEach(({ packageName }) => {
          delete devDependencies[packageName];
        });
    }
    await fs.promises.writeFile(filePath, JSON.stringify(packageJson, null, 2));
  }

  protected add(): void {
    console.log('add');
    const cwd = process.cwd();
    try {
      process.chdir(this.getTempDir());
      if (shelljs.exec('git add .').code !== 0) {
        throw new Error('git add failed');
      }
    } finally {
      process.chdir(cwd);
    }
  }

  protected commit(packageName: string, runType: string): boolean {
    console.log('commit');
    const cwd = process.cwd();
    try {
      process.chdir(this.getTempDir());
      const result = shelljs.exec(`git commit -m "🚀 ${packageName}@${runType}"`);
      if (result.code !== 0) {
        throw new Error(result.stdout);
      }
      return true;
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      if (!error.message.includes('Your branch is up to date with')) {
        throw error;
      }
      console.log('nothing to commit');
      return false;
    } finally {
      process.chdir(cwd);
    }
  }

  protected tag(tag: string): void {
    console.log('tag');
    const cwd = process.cwd();
    try {
      process.chdir(this.getTempDir());
      if (shelljs.exec(`git tag -f ${tag}`).code !== 0) {
        throw new Error('git tag failed');
      }
    } finally {
      process.chdir(cwd);
    }
  }

  protected remoteSetUrl(url: string): void {
    console.log('remote set-url');
    const cwd = process.cwd();
    try {
      process.chdir(this.getTempDir());
      if (shelljs.exec(`git remote set-url origin ${url}`).code !== 0) {
        throw new Error('git remote set-url failed');
      }
    } finally {
      process.chdir(cwd);
    }
  }

  protected push(branchOrTag: string): void {
    console.log('push');
    const cwd = process.cwd();
    try {
      process.chdir(this.getTempDir());
      if (shelljs.exec(`git push origin ${branchOrTag} --tags -f`).code !== 0) {
        throw new Error('git push failed');
      }
    } finally {
      process.chdir(cwd);
    }
  }

  protected async createYarnLock(): Promise<void> {
    console.log('create yarn.lock');
    const tempDir = this.getTempDir();
    const cwd = process.cwd();
    try {
      process.chdir(tempDir);
      const handle = await fs.promises.open('yarn.lock', 'w');
      await handle.close();
    } finally {
      process.chdir(cwd);
    }
  }

  protected async setYarnVersion(): Promise<void> {
    console.log('set yarn version');
    const tempDir = this.getTempDir();
    const cwd = process.cwd();
    try {
      process.chdir(tempDir);
      const stat = await fs.promises.stat('.yarnrc.yml').catch(() => null);
      if (stat) {
        await fs.promises.rm('.yarnrc.yml');
      }
      if (shelljs.exec('yarn set version 3.2.3').code !== 0) {
        throw new Error('yarn set version failed');
      }
      const handle = await fs.promises.open('.yarnrc.yml', 'w');
      await handle.write('yarnPath: .yarn/releases/yarn-3.2.3.cjs\n');
      await handle.write('enableImmutableInstalls: false\n');
      await handle.close();
    } finally {
      process.chdir(cwd);
    }
  }

  protected yarnInstall(): void {
    console.log('yarn install');
    const cwd = process.cwd();
    try {
      process.chdir(this.getTempDir());
      if (shelljs.exec('yarn install').code !== 0) {
        throw new Error('yarn install failed');
      }
    } finally {
      process.chdir(cwd);
    }
  }
}
