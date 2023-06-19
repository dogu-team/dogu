import { Printable } from '@dogu-tech/common';
import { Octokit } from '@octokit/rest';
import childProcess from 'child_process';
import fs from 'fs';
import { ChildProcess } from '.';
import { download } from './download';
import { RepositoryConfig } from './repositories';

export const GIT_PATH = 'git';

function validateType(type: string): void {
  if (type !== 'git') {
    throw new Error("This isn't git repository");
  }
}

/**
 * @see https://docs.github.com/en/rest/reference/repos#contents
 */
export async function downloadDirectory(repositoryConfig: RepositoryConfig, destPath: string, printable: Printable): Promise<void> {
  const { type, url, userName, subpath } = repositoryConfig;

  validateType(type);

  const { pathname } = new URL(url);
  const pathNameFiltered = pathname.replace('.git', '').replace(/^\//, '');
  const pathNameSplited = pathNameFiltered.split('/');
  if (pathNameSplited.length < 2) {
    throw new Error(`Octokit.downloadDirectory path Split failed. before: ${pathNameFiltered}`);
  }
  const owner = pathNameSplited[0];
  const repoName = pathNameSplited[1];

  const octokit = new Octokit({
    auth: userName,
  });

  await requestDirectory(octokit, owner, repoName, subpath, destPath, printable);
}

async function requestDirectory(octokit: Octokit, owner: string, repoName: string, fileSubPath: string, destRootPath: string, printable: Printable): Promise<void> {
  const res = await octokit.request(`GET /repos/${owner}/${repoName}/contents/${fileSubPath}`, {
    owner,
    repo: repoName,
    path: fileSubPath,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = res.data;
  if (!Array.isArray(data)) {
    throw new Error(`Octokit.requestDirectory path isn't directory ${fileSubPath}`);
  }

  const destPath = `${destRootPath}/${fileSubPath}`;
  if (!fs.existsSync(destPath)) {
    await fs.promises.mkdir(destPath, { recursive: true });
  }
  for (const content of data) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (content.type === 'file') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
      await download(content.download_url, `${destRootPath}/${content.path}`, {}, printable);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    } else if (content.type === 'dir') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      await requestDirectory(octokit, owner, repoName, content.path, destRootPath, printable);
    }
  }
}

interface GitCloneOptions {
  /**
   * @default false
   */
  useGithubApi?: boolean;
}

export async function clone(repositoryConfig: RepositoryConfig, destPath: string, printable: Printable, options?: GitCloneOptions): Promise<void> {
  const useGithubApi = options?.useGithubApi ?? false;
  const { type, url, subpath } = repositoryConfig;

  validateType(type);

  if (useGithubApi === true) {
    const { hostname } = new URL(url);
    if (hostname === 'github.com') {
      return await downloadDirectory(repositoryConfig, destPath, printable);
    }
  }

  if (subpath.length > 0) {
    return await cloneSparse(repositoryConfig, destPath, printable);
  }
  return await cloneFull(repositoryConfig, destPath, printable);
}

export async function cloneFull(repo: RepositoryConfig, destPath: string, printable: Printable): Promise<void> {
  printable.verbose?.('git.cloneFull');
  const urlObj = new URL(repo.url);
  const remotePath = `${urlObj.protocol}//${repo.userName}:${repo.userPassword}@${urlObj.host}${urlObj.pathname}`;
  await ChildProcess.spawnAndWait(GIT_PATH, ['clone', remotePath, destPath], {}, printable);
}

export async function cloneSparse(repositoryConfig: RepositoryConfig, destPath: string, printable: Printable): Promise<void> {
  const { type, url, branch, subpath, userName, userPassword } = repositoryConfig;

  validateType(type);

  if (!fs.existsSync(destPath)) {
    await fs.promises.mkdir(destPath, { recursive: true });
  }
  await ChildProcess.spawnAndWait(GIT_PATH, ['init'], { cwd: destPath }, printable);
  const urlObj = new URL(url);
  const remotePath = `${urlObj.protocol}//${userName}:${userPassword}@${urlObj.host}${urlObj.pathname}`;
  await ChildProcess.spawnAndWait(
    GIT_PATH,
    ['remote', 'add', '-f', 'origin', remotePath],
    {
      cwd: destPath,
    },
    printable,
  );
  await ChildProcess.spawnAndWait(
    GIT_PATH,
    ['config', 'core.sparseCheckout', 'true'],
    {
      cwd: destPath,
    },
    printable,
  );

  if (!fs.existsSync(`${destPath}/.git/info`)) {
    await fs.promises.mkdir(`${destPath}/.git/info`, { recursive: true });
  }

  await fs.promises.writeFile(`${destPath}/.git/info/sparse-checkout`, subpath);

  await ChildProcess.spawnAndWait(
    GIT_PATH,
    ['pull', 'origin', branch],
    {
      cwd: destPath,
    },
    printable,
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GitCloneOptions2 {}

export function clone2(repositoryConfig: RepositoryConfig, destPath: string, printable: Printable, options?: GitCloneOptions2): childProcess.ChildProcess {
  const { type, url, branch } = repositoryConfig;
  validateType(type);
  return ChildProcess.spawnSync(GIT_PATH, ['clone', '--branch', branch, url, destPath], {}, printable);
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GitPullOptions {}

export function pull(repositoryConfig: RepositoryConfig, destPath: string, printable: Printable, options?: GitPullOptions): childProcess.ChildProcess {
  const { type, branch } = repositoryConfig;
  validateType(type);
  return ChildProcess.spawnSync(GIT_PATH, ['pull', 'origin', branch], { cwd: destPath }, printable);
}

export type GitPullOrCloneOptions = GitPullOptions & GitCloneOptions2;

export async function pullOrClone(repositoryConfig: RepositoryConfig, destPath: string, printable: Printable, options?: GitPullOrCloneOptions): Promise<childProcess.ChildProcess> {
  const { type } = repositoryConfig;
  validateType(type);

  try {
    await fs.promises.access(destPath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
    return pull(repositoryConfig, destPath, printable);
  } catch (error) {
    return clone2(repositoryConfig, destPath, printable, options);
  }
}
