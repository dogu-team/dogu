import { Octokit } from '@octokit/rest';

export module Github {
  const GITHUB_API_VERSION = '2022-11-28';

  function createSession(token: string) {
    return new Octokit({
      auth: token,
    });
  }

  export async function readDoguConfigFile(token: string, owner: string, repo: string, path: string) {
    const octokit = createSession(token);
    const rv = await octokit.repos.getContent({
      owner,
      repo,
      path,
      headers: {
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      },
    });

    if (rv.status === 200) {
      if (Array.isArray(rv.data)) {
        throw new Error(`Failed to read dogu config file. status: ${rv.status}, message: ${rv.data}`);
      }

      const decodedContent = Buffer.from(`${(rv.data as { content: string }).content}`, 'base64').toString('utf8');
      return decodedContent;
    } else {
      throw new Error(`Failed to read dogu config file. status: ${rv.status}, message: ${rv.data}`);
    }
  }

  export const getDefaultBranch = async (token: string, owner: string, repo: string) => {
    const octokit = createSession(token);
    const rv = await octokit.repos.get({
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      },
    });

    if (rv.status === 200) {
      return rv.data.default_branch;
    } else {
      throw new Error(`Failed to get default branch. status: ${rv.status}, message: ${rv.data}`);
    }
  };

  export const getLatestCommitSha = async (token: string, owner: string, repo: string) => {
    const octokit = createSession(token);
    const defaultBranch = await getDefaultBranch(token, owner, repo);
    const rv = await octokit.repos.getBranch({
      owner,
      repo,
      branch: defaultBranch,
      headers: {
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      },
    });

    if (rv.status === 200) {
      return rv.data.commit.sha;
    } else {
      throw new Error(`Failed to get latest commit sha. status: ${rv.status}, message: ${rv.data}`);
    }
  };

  export async function getScriptFiles(token: string, owner: string, repo: string, scriptPaths: string[]) {
    const octokit = createSession(token);
    const lastCommitSha = await getLatestCommitSha(token, owner, repo);

    const rv = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: lastCommitSha,
      recursive: 'true',
      headers: {
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      },
    });

    if (rv.status === 200) {
      const tree = rv.data.tree;
      const scriptFiles = tree.filter((t) => (t.path ? scriptPaths.includes(t.path) : false));
      return scriptFiles;
    }

    throw new Error(`Failed to get script files. status: ${rv.status}, message: ${rv.data}`);
  }
}
