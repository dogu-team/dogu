import fs from 'fs';
import semver from 'semver';
import shelljs from 'shelljs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { checkEnv_DOGU_DEPLOY, cleanTemp, findRootWorkspace, getNpmTagByRunType, getPackageNameFromPackageJson, getRunType, rebuild } from '../common';
import { PartialPackageJson } from '../types';

const TempDir = '.publish-npm';

export class NpmPublisher {
  private readonly otp: string | null = null;

  constructor() {
    const argv = yargs(hideBin(process.argv))
      .option('otp', {
        type: 'string',
        description: 'otp to publish',
      })
      .parseSync();
    this.otp = argv.otp ?? null;
  }

  async publish(): Promise<void> {
    checkEnv_DOGU_DEPLOY();
    const tag = getNpmTagByRunType(getRunType());
    await cleanTemp(TempDir);
    rebuild();
    const packageName = await getPackageNameFromPackageJson();
    const { uploadVersion, packageJsonVersion } = this.getNewVersion(packageName, tag);
    await this.copy(TempDir);
    await this.modifyCopiedPackageJson(uploadVersion, tag);
    // const changed = await this.modifyOriginalPackageJson(packageJsonVersion);
    // if (changed) {
    //   this.add();
    //   const changed = this.commit(packageName, uploadVersion, packageJsonVersion);
    //   if (changed) {
    //     this.push();
    //   }
    // }
    this.publishNpm(tag);
  }

  private async copy(tempDir: string): Promise<void> {
    console.log('copy');
    const rootWorkspace = findRootWorkspace();
    await Promise.all(
      [
        { from: `${rootWorkspace}/.npmrc`, to: `${tempDir}/.npmrc` },
        { from: 'package.json', to: `${tempDir}/package.json` },
        { from: '.gitignore', to: `${tempDir}/.gitignore` },
        { from: 'README.md', to: `${tempDir}/README.md` },
        { from: 'LICENSE', to: `${tempDir}/LICENSE` },
        { from: 'build', to: `${tempDir}/build` },
      ]
        .filter(({ from }) => fs.existsSync(from))
        .map(({ from, to }) => {
          return fs.promises.cp(from, to, { recursive: true, force: true });
        }),
    );
  }

  private getNewVersion(packageName: string, tag: string): { uploadVersion: string; packageJsonVersion: string } {
    console.log(`get new version for package ${packageName} with tag ${tag}`);
    const result = shelljs.exec(`npm view ${packageName} dist-tags versions --json`);
    if (result.code !== 0) {
      if (result.stderr.includes('E404')) {
        const newVersion = '0.0.0';
        console.log(`production version not found, use ${newVersion}`);
        return { uploadVersion: newVersion, packageJsonVersion: newVersion };
      } else {
        throw new Error(`npm view ${packageName} failed`);
      }
    }
    const json = JSON.parse(result.stdout) as {
      'dist-tags': {
        [tag: string]: string;
        latest: string;
      };
      versions: string | string[];
    };
    const versions = Array.isArray(json.versions) ? json.versions : [json.versions];

    function updateNewVersion(newVersion: string): string {
      let newVersionCandidate = newVersion;
      while (versions.includes(newVersionCandidate)) {
        console.log(`version ${newVersionCandidate} already exists`);
        const match = newVersionCandidate.match(/(.+\.)(\d+)/);
        if (!match) {
          throw new Error(`version ${newVersionCandidate} is invalid`);
        }
        const prefix = match[1];
        const suffix = match[2];
        const suffixNumber = Number(suffix);
        if (isNaN(suffixNumber)) {
          throw new Error(`version ${newVersionCandidate} is invalid`);
        }
        newVersionCandidate = `${prefix}${suffixNumber + 1}`;
      }
      console.log(`new version ${newVersionCandidate}`);
      return newVersionCandidate;
    }

    const productionVersionOriginal = json['dist-tags'].latest;
    if (!productionVersionOriginal) {
      console.log('production version not found');
      const newVersionCandidate = '0.0.0';
      const newVersion = updateNewVersion(newVersionCandidate);
      return { uploadVersion: newVersion, packageJsonVersion: newVersion };
    }
    const productionVersionValid = semver.coerce(productionVersionOriginal);
    if (!productionVersionValid) {
      throw new Error(`production version ${productionVersionOriginal} is invalid`);
    }
    const productionVersion = productionVersionValid.version;
    if (tag === 'latest') {
      console.log(`production version ${productionVersion}`);
      const newVersionCandidate = semver.inc(productionVersion, 'patch');
      if (!newVersionCandidate) {
        throw new Error(`production version ${productionVersion} is invalid`);
      }
      console.log(`production new version ${newVersionCandidate}`);
      const newVersion = updateNewVersion(newVersionCandidate);
      return { uploadVersion: newVersion, packageJsonVersion: newVersion };
    } else {
      const tagVersion = json['dist-tags'][tag];
      if (!tagVersion) {
        console.log(`tag ${tag} not found`);
        const newVersionCandidate = `${productionVersion}-${tag}.1`;
        console.log(`tag ${tag} new version ${newVersionCandidate}`);
        const newVersion = updateNewVersion(newVersionCandidate);
        return { uploadVersion: newVersion, packageJsonVersion: productionVersion };
      } else {
        console.log(`tag ${tag} version ${tagVersion}`);
        const coerce = semver.coerce(tagVersion);
        if (!coerce) {
          throw new Error(`tag ${tag} version ${tagVersion} is invalid`);
        }
        const tagLeftVersion = coerce.version;
        console.log(`tag ${tag} left version ${tagLeftVersion}`);
        const productionHigher = semver.gt(productionVersion, tagLeftVersion);
        if (productionHigher) {
          console.log(`production version ${productionVersion} is higher than tag ${tag} version ${tagLeftVersion}`);
          console.log(`tag ${tag} version start with ${productionVersion}`);
          const newVersionCandidate = `${productionVersion}-${tag}.1`;
          console.log(`tag ${tag} new version ${newVersionCandidate}`);
          const newVersion = updateNewVersion(newVersionCandidate);
          return { uploadVersion: newVersion, packageJsonVersion: productionVersion };
        } else {
          console.log(`production version ${productionVersion} is lower or equal to tag ${tag} version ${tagLeftVersion}`);
          console.log(`tag ${tag} version start with ${tagLeftVersion}`);
          const tagVersionPattern = /\d+.\d+.\d+-\w+.\d+/;
          if (!tagVersionPattern.test(tagVersion)) {
            const newVersionCandidate = `${productionVersion}-${tag}.1`;
            console.log(`tag ${tag} new version ${newVersionCandidate}`);
            const newVersion = updateNewVersion(newVersionCandidate);
            return { uploadVersion: newVersion, packageJsonVersion: productionVersion };
          } else {
            const newVersionCandidate = semver.inc(tagVersion, 'prerelease');
            if (!newVersionCandidate) {
              throw new Error(`tag ${tag} version ${tagVersion} is invalid`);
            }
            console.log(`tag ${tag} new version ${newVersionCandidate}`);
            const newVersion = updateNewVersion(newVersionCandidate);
            return { uploadVersion: newVersion, packageJsonVersion: productionVersion };
          }
          throw new Error('Unexpected');
        }
        throw new Error('Unexpected');
      }
      throw new Error('Unexpected');
    }
    throw new Error('Unexpected');
  }

  private async modifyCopiedPackageJson(newVersion: string, tag: string): Promise<void> {
    console.log('modify copied package.json', { newVersion, tag });
    const filePath = `${TempDir}/package.json`;
    const content = await fs.promises.readFile(filePath, 'utf8');
    const packageJson = JSON.parse(content) as PartialPackageJson;
    const { dependencies, devDependencies } = packageJson;
    packageJson.version = newVersion;
    if (dependencies) {
      Object.keys(dependencies)
        .map((packageName) => {
          return { packageName, version: dependencies[packageName] };
        })
        .filter(({ version }) => version.startsWith('workspace:'))
        .map(({ packageName }) => {
          return { packageName, version: tag };
        })
        .forEach(({ packageName, version }) => {
          dependencies[packageName] = version;
        });
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

  private publishNpm(tag: string): void {
    console.log('publish to npm', { tag });
    const command = this.otp ? `npm publish --tag ${tag} --otp ${this.otp}` : `npm publish --tag ${tag}`;
    console.log('command', command);
    const result = shelljs.exec(command, { cwd: TempDir });
    if (result.code !== 0) {
      throw new Error(`npm publish failed`);
    }
  }

  private async modifyOriginalPackageJson(newVersion: string): Promise<boolean> {
    console.log('modify package.json', { newVersion });
    const filePath = 'package.json';
    const content = await fs.promises.readFile(filePath, 'utf8');
    const packageJson = JSON.parse(content) as PartialPackageJson;
    if (packageJson.version === newVersion) {
      console.log('package.json version is not changed', { version: packageJson.version, newVersion });
      return false;
    }
    packageJson.version = newVersion;
    await fs.promises.writeFile(filePath, JSON.stringify(packageJson, null, 2));
    return true;
  }

  private add(): void {
    if (shelljs.exec('git add package.json').code !== 0) {
      throw new Error('git add failed');
    }
  }

  private commit(packageName: string, uploadVersion: string, packageJsonVersion: string): boolean {
    console.log('commit changes');
    const result = shelljs.exec(`git commit -m "🚀 ${packageName}@${uploadVersion} (${packageJsonVersion})"`);
    if (result.code !== 0) {
      if (result.stdout.includes('Your branch is up to date with')) {
        console.log('nothing to commit');
        return false;
      }
      throw new Error('git commit failed');
    }
    return true;
  }

  private push(): void {
    console.log('push');
    if (shelljs.exec('git push').code !== 0) {
      throw new Error('git push failed');
    }
  }
}
