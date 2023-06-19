import fs from 'fs';
import { checkEnv_DOGU_DEPLOY, cleanTemp, getNpmTagFromRunType, getPackageNameFromPackageJson, getRunType, rebuild } from '../common';
import { GitRepoPublisher } from './publisher';

export class GithubActionPublisher extends GitRepoPublisher {
  override async publish(): Promise<void> {
    checkEnv_DOGU_DEPLOY();
    this.checkEnv_DOGU_ACTIONS_PUBLISH_TOKEN();
    const runType = getRunType();
    const tag = runType;
    const npmTag = getNpmTagFromRunType(tag);
    await cleanTemp(this.getTempDir());
    rebuild();
    const packageName = await getPackageNameFromPackageJson();
    const skip = this.skipIfNotExist(packageName);
    if (skip) {
      return;
    }
    const url = this.clone(packageName, runType, tag);
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
    this.tag(tag);
    this.remoteSetUrl(url);
    this.push(tag);
  }

  private checkEnv_DOGU_ACTIONS_PUBLISH_TOKEN(): void {
    console.log('check DOGU_ACTIONS_PUBLISH_TOKEN');
    if (!process.env.DOGU_ACTIONS_PUBLISH_TOKEN) {
      throw new Error('DOGU_ACTIONS_PUBLISH_TOKEN not found');
    }
  }

  async copy(): Promise<void> {
    console.log('copy action');
    const tempDir = this.getTempDir();
    await Promise.all(
      [
        { from: 'package.json', to: `${tempDir}/package.json` },
        { from: '.gitignore', to: `${tempDir}/.gitignore` },
        { from: 'README.md', to: `${tempDir}/README.md` },
        { from: 'LICENSE', to: `${tempDir}/LICENSE` },
        { from: 'build', to: `${tempDir}/build` },
        { from: 'src', to: `${tempDir}/src` },
        { from: 'action.config.yaml', to: `${tempDir}/action.config.yaml` },
      ]
        .filter(({ from }) => fs.existsSync(from))
        .map(({ from, to }) => {
          return fs.promises.cp(from, to, { recursive: true, force: true });
        }),
    );
  }
}
