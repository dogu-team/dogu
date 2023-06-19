import { OctokitContext } from '@dogu-tech/node';
import fs from 'fs';
import path from 'path';
import { deviceServerEnv, env } from './env';

const client = new OctokitContext(env.DOGU_GITHUB_TOKEN).client;

const ProjectRoot = path.join(__dirname, '../');
const Owner = 'dogu-team';
const Repo = 'dogu';
const TagPrefix = 'Dost';
const BigfilesInitialCommitHash = '441bbfd24badcd357c0cc7631dd7debd2fb69c9c';

interface ReleaseInfo {
  id: number;
  upload_url: string;
}

function getVersion(): string {
  // read version from package.json
  const packageJson = require(path.join(ProjectRoot, 'package.json'));
  return packageJson.version;
}

async function createRelease(commit: string, version: string): Promise<ReleaseInfo> {
  const tagName = `${TagPrefix}-${deviceServerEnv.DOGU_RUN_TYPE}-${process.env.GITHUB_WORKFLOW ?? 'local'}-${version}`;
  const preExistRelease = await client
    .request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
      owner: Owner,
      repo: Repo,
      tag: tagName,
    })
    .then((response) => {
      return response;
    })
    .catch((error: Error) => {
      return null;
    });
  if (preExistRelease) {
    return {
      id: preExistRelease.data.id,
      upload_url: preExistRelease.data.upload_url,
    };
  } else {
    const res = await client.request('POST /repos/{owner}/{repo}/releases', {
      owner: Owner,
      repo: Repo,
      tag_name: tagName,
      target_commitish: commit,
      name: tagName,
      body: 'Description of the release',
      draft: false,
      prerelease: false,
      generate_release_notes: false,
    });
    return {
      id: res.data.id,
      upload_url: res.data.upload_url,
    };
  }
}

async function setReleaseAsset(release: ReleaseInfo, filePath: string): Promise<void> {
  const fileName = path.basename(filePath).replaceAll(' ', '.');
  // get asset
  const preExistAsset = await client.request('GET /repos/{owner}/{repo}/releases/{release_id}/assets', {
    owner: Owner,
    repo: Repo,
    release_id: release.id,
  });
  // delete asset
  for (const asset of preExistAsset.data) {
    if (asset.name === fileName) {
      await client.request('DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}', {
        owner: Owner,
        repo: Repo,
        asset_id: asset.id,
      });
    }
  }
  // upload asset
  await client.request('POST {url}', {
    url: release.upload_url,
    headers: {
      'content-type': 'application/octet-stream',
      'content-length': 0,
    },
    name: fileName,
    data: await fs.promises.readFile(filePath),
  });
}

export async function upload(filePath: string): Promise<void> {
  const commit = BigfilesInitialCommitHash;
  const version = getVersion();
  const release = await createRelease(commit, version);
  await setReleaseAsset(release, filePath);
}
