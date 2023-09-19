import { Printable } from '@dogu-tech/common';
import { Octokit } from 'octokit';
import { download } from '../download';

export class OctokitContext {
  public readonly client: Octokit;
  constructor(readonly token: string) {
    this.client = new Octokit({ auth: token });
  }

  async listReleaseAssetsId(owner: string, repo: string, releaseId: string): Promise<{ name: string; id: number }[]> {
    const releaseInfo = await this.client.rest.repos.getReleaseByTag({ owner, repo, tag: releaseId });
    const assets = releaseInfo.data.assets;
    return assets.map((asset) => ({ name: asset.name, id: asset.id }));
  }

  async downloadReleaseAsset(owner: string, repo: string, assetId: number, destPath: string, printable: Printable): Promise<void> {
    const asset = await this.client.rest.repos.getReleaseAsset({ owner, repo, asset_id: assetId });
    await download({
      url: asset.data.url,
      filePath: destPath,
      headers: { Authorization: `token ${this.token}`, Accept: 'application/octet-stream' },
      logger: printable,
    });
  }
}
