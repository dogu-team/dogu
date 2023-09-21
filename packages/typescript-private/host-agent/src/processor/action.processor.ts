import { Action, ErrorResult } from '@dogu-private/console-host-agent';
import { ActionContextEnv } from '@dogu-private/types';
import { ActionConfigLoader } from '@dogu-tech/action-kit';
import { ChildProcess, EnvironmentVariableReplacementProvider, GitCommand, GitCommandBuilder, HostPaths, isGitRepositoryPath, isSameRemoteOriginUrl } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { DeviceClientService } from '../device-client/device-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { MessageContext } from '../message/message.types';
import { optionsConfig } from '../options-config.instance';
import { StepMessageContext } from '../step/step.types';
import { CommandProcessRegistry } from './command.process-registry';

interface PackageJson {
  dependencies?: Record<string, string>;
}

interface PrepareResult {
  error?: ErrorResult;
  actionGitPath?: string;
}

function getActionTagByRunType(runType: string): string {
  switch (runType) {
    case 'production':
    case 'self-hosted':
      return 'latest';
    default:
      return runType;
  }
}

@Injectable()
export class ActionProcessor {
  constructor(private readonly deviceClientService: DeviceClientService, private readonly logger: DoguLogger, private readonly commandProcessRegistry: CommandProcessRegistry) {}

  async action(action: Action, context: MessageContext): Promise<ErrorResult> {
    const { info, environmentVariableReplacer } = context;
    const { actionId, inputs } = action;
    this.logger.verbose('action started', { action });
    const pathMap = await this.deviceClientService.deviceHostClient.getPathMap();
    const yarnPath = pathMap.common.yarn;
    const gitPath = pathMap.common.git;

    const workspacePath = await this.resolveWorkspacePath(context);
    this.logger.verbose('action workspace path', { workspacePath });

    const { error, actionGitPath } = await this.prepare(context, workspacePath, actionId, gitPath, yarnPath);
    if (error) {
      return error;
    } else if (!actionGitPath) {
      throw new Error('Unexpected prepare error');
    }
    const actionContextEnv: ActionContextEnv = {
      DOGU_ACTION_INPUTS: JSON.stringify(inputs),
    };
    environmentVariableReplacer.stackProvider.push(new EnvironmentVariableReplacementProvider(actionContextEnv));
    const env = environmentVariableReplacer.stackProvider.export();
    return this.parseConfigAndRun(context, actionGitPath, env, yarnPath);
  }

  private async resolveWorkspacePath(context: MessageContext): Promise<string> {
    if (context instanceof StepMessageContext) {
      const { deviceRunnerId } = context;
      const deviceRunnerWorkspacePath = HostPaths.deviceRunnerWorkspacePath(HostPaths.doguHomePath, deviceRunnerId);
      await fs.promises.mkdir(deviceRunnerWorkspacePath, { recursive: true });
      return deviceRunnerWorkspacePath;
    } else {
      const { info } = context;
      const { deviceWorkspacePath } = info;
      return deviceWorkspacePath;
    }
  }

  private async prepare(context: MessageContext, workspacePath: string, actionId: string, gitPath: string, yarnPath: string): Promise<PrepareResult> {
    this.logger.verbose('action prepare', { actionId });
    if (this.useSource()) {
      const actionSourcePath = await this.findSource(actionId);
      if (actionSourcePath) {
        return { actionGitPath: actionSourcePath };
      } else {
        return this.fetchGitAndUpdateYarn(context, workspacePath, actionId, gitPath, yarnPath);
      }
    } else {
      return this.fetchGitAndUpdateYarn(context, workspacePath, actionId, gitPath, yarnPath);
    }
  }

  private useSource(): boolean {
    const useActionSource = optionsConfig.get('actionSource.use', false);
    this.logger.debug('action use source', { useSource: useActionSource });
    return useActionSource;
  }

  private async findSource(actionId: string): Promise<string | null> {
    this.logger.debug('find action source', { actionId });
    const searchPaths = optionsConfig.get<string[]>('actionSource.searchPaths', []);
    for (const searchPath of searchPaths) {
      const candidate = path.resolve(searchPath, actionId);
      this.logger.debug('action source candidate', { actionId, candidate });
      const actionConfigPath = path.resolve(candidate, 'action.config.yaml');
      const stat = await fs.promises.stat(actionConfigPath).catch(() => null);
      if (stat) {
        this.logger.debug('action source found', { actionId, candidate });
        return candidate;
      }
    }
    this.logger.debug('action source not found', { actionId });
    return null;
  }

  private async fetchGit(context: MessageContext, workspacePath: string, actionId: string, gitPath: string): Promise<PrepareResult> {
    const actionGitPath = HostPaths.deviceActionGitPath(workspacePath, actionId);
    const gitCommandBuilder = new GitCommandBuilder(gitPath, actionGitPath);
    const url = `https://github.com/${actionId}.git`;
    const tag = getActionTagByRunType(env.DOGU_RUN_TYPE);

    if (!(await isGitRepositoryPath(actionGitPath))) {
      this.logger.info('action git path is not git repo path. delete action git path.', { actionGitPath });
      await fs.promises.rm(actionGitPath, { recursive: true, force: true });

      this.logger.info('action git clone', { url, actionGitPath });
      const cloneCommand = await gitCommandBuilder.clone({
        url,
      });
      const errorResult = await this.runGitCommand(cloneCommand, context);
      if (errorResult.value.code !== 0) {
        return { error: errorResult };
      }
    }

    if (!(await isSameRemoteOriginUrl(gitPath, actionGitPath, url))) {
      this.logger.info('action git path is not same remote origin url. delete action git path.', { actionGitPath });
      await fs.promises.rm(actionGitPath, { recursive: true, force: true });

      this.logger.info('action git clone', { url, actionGitPath });
      const cloneCommand = await gitCommandBuilder.clone({
        url,
      });
      const errorResult = await this.runGitCommand(cloneCommand, context);
      if (errorResult.value.code !== 0) {
        return { error: errorResult };
      }
    }

    {
      this.logger.info('action git reset', { actionGitPath });
      const gitCommand = await gitCommandBuilder.reset();
      const errorResult = await this.runGitCommand(gitCommand, context);
      if (errorResult.value.code !== 0) {
        return { error: errorResult };
      }
    }

    {
      this.logger.info('action git clean', { actionGitPath });
      const gitCommand = await gitCommandBuilder.clean();
      const errorResult = await this.runGitCommand(gitCommand, context);
      if (errorResult.value.code !== 0) {
        return { error: errorResult };
      }
    }

    {
      this.logger.info('action git fetch', { actionGitPath });
      const gitCommand = await gitCommandBuilder.fetch();
      const errorResult = await this.runGitCommand(gitCommand, context);
      if (errorResult.value.code !== 0) {
        return { error: errorResult };
      }
    }

    {
      this.logger.info('action git checkout', { tag, actionGitPath });
      const gitCommand = await gitCommandBuilder.checkout({
        tag,
      });
      const errorResult = await this.runGitCommand(gitCommand, context);
      if (errorResult.value.code !== 0) {
        return { error: errorResult };
      }
    }

    return { actionGitPath };
  }

  private async updateYarn(context: MessageContext, actionGitPath: string, yarnPath: string): Promise<ErrorResult> {
    const yarnLockPath = path.resolve(actionGitPath, 'yarn.lock');
    const stat = await fs.promises.stat(yarnLockPath).catch(() => null);
    if (!stat) {
      this.logger.verbose('action yarn.lock not found', { actionGitPath });
      const handle = await fs.promises.open(yarnLockPath, 'w');
      await handle.close();
      this.logger.verbose('action yarn.lock created', { actionGitPath });
    } else {
      this.logger.verbose('action yarn.lock found', { actionGitPath });
    }
    this.logger.verbose('action yarn install...', { actionGitPath });
    const installResult = await this.commandProcessRegistry.command(yarnPath, ['install'], { cwd: actionGitPath }, context);
    if (installResult.value.code !== 0) {
      return installResult;
    }
    this.logger.verbose('action yarn up...', { actionGitPath });
    const packageJsonPath = path.resolve(actionGitPath, 'package.json');
    const content = await fs.promises.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content) as PackageJson;
    const doguDependencies: string[] = [];
    if (packageJson.dependencies) {
      for (const [key, value] of Object.entries(packageJson.dependencies)) {
        if (key.startsWith('@dogu-tech/')) {
          doguDependencies.push(key);
        }
      }
    }
    for (const doguDependency of doguDependencies) {
      this.logger.verbose('action yarn up dogu dependency...', { actionGitPath, doguDependency });
      const upResult = await this.commandProcessRegistry.command(yarnPath, ['up', '-R', doguDependency], { cwd: actionGitPath }, context);
      if (upResult.value.code !== 0) {
        return upResult;
      }
    }
    return {
      kind: 'ErrorResult',
      value: {
        code: 0,
        message: 'success',
      },
    };
  }

  private async fetchGitAndUpdateYarn(context: MessageContext, workspacePath: string, actionId: string, gitPath: string, yarnPath: string): Promise<PrepareResult> {
    const { error, actionGitPath } = await this.fetchGit(context, workspacePath, actionId, gitPath);
    if (error) {
      return { error };
    } else if (!actionGitPath) {
      throw new Error('Unexpected fetch git error');
    }
    const errorResult = await this.updateYarn(context, actionGitPath, yarnPath);
    if (errorResult.value.code !== 0) {
      return { error: errorResult };
    } else {
      return { actionGitPath };
    }
  }

  private async parseConfigAndRun(context: MessageContext, actionGitPath: string, env: Record<string, string | undefined>, yarnPath: string): Promise<ErrorResult> {
    this.logger.verbose('action parse config', { actionGitPath });
    const loader = new ActionConfigLoader({
      workingDir: actionGitPath,
    });
    const config = await loader.load();
    const { runs_main } = config;
    const useSource = this.useSource();
    this.logger.verbose('action run', { actionGitPath, runs_main });
    return this.commandProcessRegistry.command(
      useSource ? 'yarn' : yarnPath,
      ['node', runs_main],
      {
        cwd: actionGitPath,
        env,
        shell: ChildProcess.defaultShell(),
      },
      context,
    );
  }

  private async runGitCommand(gitCommand: GitCommand, context: MessageContext): Promise<ErrorResult> {
    const { executablePath, env, args } = gitCommand;
    return await this.commandProcessRegistry.command(executablePath, args, { env }, context);
  }
}
