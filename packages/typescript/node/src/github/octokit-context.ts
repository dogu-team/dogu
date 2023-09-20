import { Printable } from '@dogu-tech/common';
import { Octokit } from 'octokit';
import { download } from '../download';

type OctokitOptions = ConstructorParameters<typeof Octokit>[0];

export interface AssetInfo {
  name: string;
  id: number;
}

export class OctokitContext {
  public readonly client: Octokit;
  constructor(readonly token: string | null) {
    const options: OctokitOptions = {};
    if (token) {
      options.auth = token;
    }

    this.client = new Octokit(options);
  }

  async listReleaseAssetsId(owner: string, repo: string, releaseId: string): Promise<AssetInfo[]> {
    const releaseInfo = await this.client.rest.repos.getReleaseByTag({ owner, repo, tag: releaseId });
    const assets = releaseInfo.data.assets;
    return assets.map((asset) => ({ name: asset.name, id: asset.id }));
  }

  async downloadReleaseAsset(owner: string, repo: string, assetId: number, destPath: string, printable: Printable): Promise<void> {
    const asset = await this.client.rest.repos.getReleaseAsset({ owner, repo, asset_id: assetId });
    const headers: Record<string, string> = {
      Accept: 'application/octet-stream',
    };
    if (this.token) {
      headers.Authorization = `token ${this.token}`;
    }

    await download({
      url: asset.data.url,
      filePath: destPath,
      headers,
      logger: printable,
    });
  }

  async getLatestReleaseInfo(owner: string, repo: string, timeout: number): Promise<{ tagName: string; assetInfos: AssetInfo[] }> {
    const releaseInfo = await this.client.rest.repos.getLatestRelease({ owner, repo, timeout });
    const { data } = releaseInfo;
    const assetInfos = data.assets.map((asset) => ({ name: asset.name, id: asset.id }));
    return { tagName: data.tag_name, assetInfos };
  }
}
