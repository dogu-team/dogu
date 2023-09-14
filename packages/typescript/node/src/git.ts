import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface GitEnv extends NodeJS.ProcessEnv {
  GIT_TERMINAL_PROMPT: 'false';
  GIT_ASK_YESNO: 'false';
}

export interface GitCommand {
  executablePath: string;
  env: GitEnv;
  args: string[];
}

export interface GitFetchOptions {
  depth?: number;
  force?: boolean;
}

function mergeGitFetchOptions(options?: GitFetchOptions): Required<GitFetchOptions> {
  return {
    depth: 1,
    force: true,
    ...options,
  };
}

export interface GitResetOptions {
  hard?: boolean;
}

function mergeGitResetOptions(options?: GitResetOptions): Required<GitResetOptions> {
  return {
    hard: true,
    ...options,
  };
}

export interface GitCleanOptions {
  force?: boolean;
  recursive?: boolean;
  removeUntracked?: boolean;
}

function mergeGitCleanOptions(options?: GitCleanOptions): Required<GitCleanOptions> {
  return {
    force: true,
    recursive: true,
    removeUntracked: true,
    ...options,
  };
}

export interface GitCloneOptions {
  url: string;
}

export interface GitCheckoutWithBranchOptions {
  branch: string;
  tag?: never;
}

export interface GitCheckoutWithTagOptions {
  branch?: never;
  tag: string;
}

export type GitCheckoutOptions = GitCheckoutWithBranchOptions | GitCheckoutWithTagOptions;

export interface GitPullOptions {
  noFastForward?: boolean;
  allowUnrelatedHistories?: boolean;
}

function mergeGitPullOptions(options?: GitPullOptions): Required<GitPullOptions> {
  return {
    noFastForward: true,
    allowUnrelatedHistories: true,
    ...options,
  };
}

export class GitCommandBuilder {
  constructor(private readonly executablePath: string, private readonly workingPath: string) {}

  private async validateExecutablePath(): Promise<void> {
    await fs.promises.access(this.executablePath, fs.constants.X_OK);
  }

  private async ensureWorkingPath(): Promise<void> {
    await fs.promises.mkdir(this.workingPath, { recursive: true });
  }

  private async ensurePaths(): Promise<void> {
    await this.validateExecutablePath();
    await this.ensureWorkingPath();
  }

  async version(): Promise<GitCommand> {
    await this.ensurePaths();
    return {
      executablePath: this.executablePath,
      env: this.defaultEnv(),
      args: this.defaultArgs().concat(['--version']),
    };
  }

  async clone(options: GitCloneOptions): Promise<GitCommand> {
    await this.ensurePaths();
    const { url } = options;
    return {
      executablePath: this.executablePath,
      env: this.defaultEnv(),
      args: this.defaultArgs().concat(['clone', url, '.']),
    };
  }

  async remoteGetUrlOrigin(): Promise<GitCommand> {
    await this.ensurePaths();
    return {
      executablePath: this.executablePath,
      env: this.defaultEnv(),
      args: this.defaultArgs().concat(['remote', 'get-url', 'origin']),
    };
  }

  async fetch(options?: GitFetchOptions): Promise<GitCommand> {
    await this.ensurePaths();
    const { depth, force } = mergeGitFetchOptions(options);
    const args = this.defaultArgs().concat(['fetch', '--all', '--tags', '--prune', '--prune-tags', `--depth=${depth}`]);
    if (force) {
      args.push('--force');
    }
    return {
      executablePath: this.executablePath,
      env: this.defaultEnv(),
      args,
    };
  }

  async checkout(options: GitCheckoutOptions): Promise<GitCommand> {
    await this.ensurePaths();

    const { branch, tag } = options;
    if (branch && tag) {
      throw new Error('branch and tag cannot be specified at the same time');
    }

    if (!branch && !tag) {
      throw new Error('branch or tag must be specified');
    }

    const args = this.defaultArgs().concat(['checkout']);
    if (tag) {
      args.push(`tags/${tag}`);
    } else if (branch) {
      args.push(branch);
    }

    return {
      executablePath: this.executablePath,
      env: this.defaultEnv(),
      args,
    };
  }

  async reset(options?: GitResetOptions): Promise<GitCommand> {
    await this.ensurePaths();
    const { hard } = mergeGitResetOptions(options);
    const args = this.defaultArgs().concat(['reset']);
    if (hard) {
      args.push('--hard');
    }

    return {
      executablePath: this.executablePath,
      env: this.defaultEnv(),
      args,
    };
  }

  async clean(options?: GitCleanOptions): Promise<GitCommand> {
    await this.ensurePaths();
    const { force, recursive, removeUntracked } = mergeGitCleanOptions(options);
    const args = this.defaultArgs().concat(['clean']);
    if (force) {
      args.push('-f');
    }
    if (recursive) {
      args.push('-d');
    }
    if (removeUntracked) {
      args.push('-x');
    }

    return {
      executablePath: this.executablePath,
      env: this.defaultEnv(),
      args,
    };
  }

  async pull(options?: GitPullOptions): Promise<GitCommand> {
    await this.ensurePaths();
    const { noFastForward, allowUnrelatedHistories } = mergeGitPullOptions(options);
    const args = this.defaultArgs().concat(['pull']);
    if (noFastForward) {
      args.push('--no-ff');
    }

    if (allowUnrelatedHistories) {
      args.push('--allow-unrelated-histories');
    }

    return {
      executablePath: this.executablePath,
      env: this.defaultEnv(),
      args,
    };
  }

  private defaultArgs(): string[] {
    return ['-C', this.workingPath, '-c', 'core.longpaths=true'];
  }

  private defaultEnv(): GitEnv {
    return {
      GIT_TERMINAL_PROMPT: 'false',
      GIT_ASK_YESNO: 'false',
    };
  }
}

export async function isGitRepositoryPath(workingPath: string): Promise<boolean> {
  const dotGitPath = path.resolve(workingPath, '.git');
  return await fs.promises
    .stat(dotGitPath)
    .then((stat) => stat.isDirectory())
    .catch(() => false);
}

export async function isSameRemoteOriginUrl(gitExecutablePath: string, workingPath: string, url: string): Promise<boolean> {
  const gitCommandBuilder = new GitCommandBuilder(gitExecutablePath, workingPath);
  const gitCommand = await gitCommandBuilder.remoteGetUrlOrigin();
  const { executablePath, args, env } = gitCommand;
  const { stdout } = await execFileAsync(executablePath, args, { env, timeout: 60_000, encoding: 'utf8' });
  const configUrl = stdout.trim();
  const parsedConfigUrl = new URL(configUrl);
  const parsedUrl = new URL(url);
  return parsedConfigUrl.origin === parsedUrl.origin && parsedConfigUrl.pathname === parsedUrl.pathname;
}
