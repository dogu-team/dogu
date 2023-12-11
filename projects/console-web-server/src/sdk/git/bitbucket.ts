import { DoguConfig } from '@dogu-private/console';
import { DOGU_CONFIG_FILE_NAME } from '@dogu-private/types';
import axios from 'axios';
import { Bitbucket as BitbucketClient } from 'bitbucket';
import { Schema } from 'bitbucket/lib/bitbucket';

export module Bitbucket {
  function createSession(url: string, token: string) {
    return new BitbucketClient({
      baseUrl: url,
      auth: {
        token,
      },
    });
  }

  export async function findAllRepositories(token: string, workspace: string): Promise<Schema.PaginatedRepositories> {
    const bitbucketClient = createSession('https://api.bitbucket.org/2.0', token);
    const rv = await bitbucketClient.repositories.list({
      workspace,
      pagelen: 100,
    });

    if (rv.status === 200) {
      return rv.data;
    } else {
      throw new Error(`Failed to get repositories. status: ${rv.status}, message: ${rv.data}`);
    }
  }

  export async function getDefaultBranch(token: string, workspace: string, repo: string): Promise<string> {
    const bitbucketClient = createSession('https://api.bitbucket.org/2.0', token);
    const rv = await bitbucketClient.repositories.get({
      workspace,
      repo_slug: repo,
    });

    if (rv.status === 200) {
      if (!rv.data?.mainbranch?.name) {
        throw new Error(`Failed to get default branch. status: ${rv.status}, message: ${rv.data.mainbranch}`);
      }

      return rv.data.mainbranch.name;
    } else {
      throw new Error(`Failed to get default branch. status: ${rv.status}, message: ${rv.data}`);
    }
  }

  export async function getLatestCommitSha(token: string, workspace: string, repo: string): Promise<string> {
    const bitbucketClient = createSession('https://api.bitbucket.org/2.0', token);
    const defaultBranch = await getDefaultBranch(token, workspace, repo);
    const rv = await bitbucketClient.repositories.listCommits({
      workspace,
      repo_slug: repo,
      q: `branch.name="${defaultBranch}"`,
    });

    if (rv.status === 200) {
      if (!rv.data?.values?.[0]?.hash) {
        throw new Error(`Failed to get latest commit sha. status: ${rv.status}, message: ${rv.data.values}`);
      }

      return rv.data.values[0].hash;
    } else {
      throw new Error(`Failed to get latest commit sha. status: ${rv.status}, message: ${rv.data}`);
    }
  }

  export async function readDoguConfigFile(token: string, workspace: string, repo: string): Promise<DoguConfig> {
    const defaultBranch = await getDefaultBranch(token, workspace, repo);
    const rv = await axios.get(`https://api.bitbucket.org/2.0/repositories/${workspace}/${repo}/src/${defaultBranch}/${DOGU_CONFIG_FILE_NAME}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (rv.status === 200) {
      return rv.data;
    } else {
      throw new Error(`Failed to read dogu config file. status: ${rv.status}, message: ${rv.data}`);
    }
  }

  export async function getScriptFiles(token: string, workspace: string, repo: string, scriptPaths: string[]): Promise<Schema.Treeentry[]> {
    const bitbucketClient = createSession('https://api.bitbucket.org/2.0', token);
    const commitSha = await getLatestCommitSha(token, workspace, repo);
    const rv = await bitbucketClient.repositories.readSrc({
      workspace,
      repo_slug: repo,
      commit: commitSha,
      path: scriptPaths[0],
    });

    if (rv.status === 200) {
      const files = await getFilesRecursively(rv.data, token);
      return files;
    } else {
      throw new Error(`Failed to get script files. status: ${rv.status}, message: ${rv.data}`);
    }
  }

  async function getFilesRecursively(root: Schema.PaginatedTreeentries, token: string): Promise<Schema.Treeentry[]> {
    if (!root.values) {
      return [];
    }

    const filePromises: Promise<Schema.Treeentry[]>[] = [];

    for (const entry of root.values) {
      if (entry.type === 'commit_directory') {
        const rv = await axios.get((entry.links as { self: { href: string } }).self.href, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (rv.status === 200) {
          filePromises.push(getFilesRecursively(rv.data, token));
        } else {
          throw new Error(`Failed to get files recursively. status: ${rv.status}, message: ${rv.data}`);
        }
      } else if (entry.type === 'commit_file') {
        filePromises.push(Promise.resolve([entry]));
      } else {
        throw new Error(`Unknown entry type: ${entry.type}`);
      }
    }

    return (await Promise.all(filePromises)).flat();
  }
}
