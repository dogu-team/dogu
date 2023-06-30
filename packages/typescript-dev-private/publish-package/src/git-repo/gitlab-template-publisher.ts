import fs from 'fs';
import { checkEnv_DOGU_DEPLOY, cleanTemp, getNpmTagByRunType, getPackageNameFromPackageJson, getRunType, rebuild } from '../common';
import { GitRepoPublisher } from './publisher';

export class GitlabTemplatePublisher extends GitRepoPublisher {
  override getTempDir(): string {
    return '.publish-gitlab';
  }

  override async publish(): Promise<void> {
    checkEnv_DOGU_DEPLOY();
    this.checkEnv_DOGU_GITLAB_ROOT_TOKEN();
    const runType = getRunType();
    const branch = 'main';
    const npmTag = getNpmTagByRunType(runType);
    await cleanTemp(this.getTempDir());
    rebuild();
    const packageName = await getPackageNameFromPackageJson();
    const skip = this.skipIfNotExist(packageName);
    if (skip) {
      return;
    }
    this.clone(packageName, runType, branch);
    this.deleteContents();
    await this.copy();
    await this.modifyPackageJson(npmTag);
    await this.createYarnLock();
    await this.setYarnVersion();
    this.yarnInstall();
    this.add();
    const changed = this.commit(packageName, runType);
    if (!changed) {
      return;
    }
    this.push(branch);
  }

  private checkEnv_DOGU_GITLAB_ROOT_TOKEN(): void {
    console.log('check DOGU_GITLAB_ROOT_TOKEN');
    if (!process.env.DOGU_GITLAB_ROOT_TOKEN) {
      throw new Error('DOGU_GITLAB_ROOT_TOKEN not found');
    }
  }

  async copy(): Promise<void> {
    console.log('copy template files');
    const tempDir = this.getTempDir();
    await Promise.all(
      [
        { from: '.vscode', to: `${tempDir}/.vscode` },
        { from: 'test', to: `${tempDir}/test` },
        { from: '.eslintignore', to: `${tempDir}/.eslintignore` },
        { from: '.eslintrc.cjs', to: `${tempDir}/.eslintrc.cjs` },
        { from: '.gitignore', to: `${tempDir}/.gitignore` },
        { from: 'dogu.config.json', to: `${tempDir}/dogu.config.json` },
        { from: 'nodemon.json', to: `${tempDir}/nodemon.json` },
        { from: 'package.json', to: `${tempDir}/package.json` },
        { from: 'README.md', to: `${tempDir}/README.md` },
        { from: 'tsconfig.json', to: `${tempDir}/tsconfig.json` },
        { from: '.yarnrc.yml', to: `${tempDir}/.yarnrc.yml` },
        { from: '.yarn', to: `${tempDir}/.yarn` },
      ]
        .filter(({ from }) => fs.existsSync(from))
        .map(({ from, to }) => {
          return fs.promises.cp(from, to, { recursive: true, force: true });
        }),
    );
  }
}
