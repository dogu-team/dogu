import { Action, ErrorResult } from '@dogu-private/console-host-agent';
import { ActionContextEnv } from '@dogu-private/types';
import { ActionConfigLoader } from '@dogu-tech/action-kit';
import { EnvironmentVariableReplacementProvider, HostPaths } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { DeviceClientService } from '../device-client/device-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { MessageContext } from '../message/message.types';
import { optionsConfig } from '../options-config.instance';
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
    const { deviceWorkspacePath } = info;
    const { actionId, inputs } = action;
    this.logger.verbose('action started', { action });
    const pathMap = await this.deviceClientService.deviceHostClient.getPathMap();
    const yarnPath = pathMap.common.yarn;
    const gitPath = pathMap.common.git;
    const { error, actionGitPath } = await this.prepare(context, deviceWorkspacePath, actionId, gitPath, yarnPath);
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

  private async prepare(context: MessageContext, deviceWorkspacePath: string, actionId: string, gitPath: string, yarnPath: string): Promise<PrepareResult> {
    this.logger.verbose('action prepare', { actionId });
    if (this.useSource()) {
      const actionSourcePath = await this.findSource(actionId);
      if (actionSourcePath) {
        return { actionGitPath: actionSourcePath };
      } else {
        return this.fetchGitAndUpdateYarn(context, deviceWorkspacePath, actionId, gitPath, yarnPath);
      }
    } else {
      return this.fetchGitAndUpdateYarn(context, deviceWorkspacePath, actionId, gitPath, yarnPath);
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

  private async fetchGit(context: MessageContext, deviceWorkspacePath: string, actionId: string, gitPath: string): Promise<PrepareResult> {
    const actionGitPath = HostPaths.deviceActionGitPath(deviceWorkspacePath, actionId);
    const dotGitPath = path.resolve(actionGitPath, '.git');
    const stat = await fs.promises.stat(dotGitPath).catch(() => null);
    const configArgs = ['-c', 'core.longpaths=true'];
    const tag = getActionTagByRunType(env.DOGU_RUN_TYPE);
    if (!stat) {
      this.logger.verbose('action git path is not git repo', { actionGitPath });
      this.logger.verbose('delete action git path', { actionGitPath });
      await fs.promises.rm(actionGitPath, { recursive: true, force: true });
      const url = `https://github.com/${actionId}.git`;
      this.logger.verbose('action git clone', { url, actionGitPath });
      const result = await this.commandProcessRegistry.command(gitPath, [...configArgs, 'clone', '--depth', '1', '--branch', tag, url, actionGitPath], {}, context);
      if (result.value.code !== 0) {
        return { error: result };
      }
    } else {
      this.logger.verbose('action git path is git repo', { actionGitPath });
      this.logger.verbose('action git reset', { actionGitPath });
      const resetResult = await this.commandProcessRegistry.command(gitPath, [...configArgs, '-C', actionGitPath, 'reset', '--hard'], {}, context);
      if (resetResult.value.code !== 0) {
        return { error: resetResult };
      }
      this.logger.verbose('action git clean', { actionGitPath });
      const cleanResult = await this.commandProcessRegistry.command(gitPath, [...configArgs, '-C', actionGitPath, 'clean', '-fdx'], {}, context);
      if (cleanResult.value.code !== 0) {
        return { error: cleanResult };
      }
      this.logger.verbose('action git fetch', { actionGitPath });
      const fetchResult = await this.commandProcessRegistry.command(gitPath, [...configArgs, '-C', actionGitPath, 'fetch', 'origin', tag], {}, context);
      if (fetchResult.value.code !== 0) {
        return { error: fetchResult };
      }
      this.logger.verbose('action git checkout', { actionGitPath });
      const checkoutResult = await this.commandProcessRegistry.command(gitPath, [...configArgs, '-C', actionGitPath, 'checkout', tag], {}, context);
      if (checkoutResult.value.code !== 0) {
        return { error: checkoutResult };
      }
      this.logger.verbose('action git pull', { actionGitPath });
      const pullResult = await this.commandProcessRegistry.command(gitPath, [...configArgs, '-C', actionGitPath, 'pull'], {}, context);
      if (pullResult.value.code !== 0) {
        return { error: pullResult };
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

  private async fetchGitAndUpdateYarn(context: MessageContext, deviceWorkspacePath: string, actionId: string, gitPath: string, yarnPath: string): Promise<PrepareResult> {
    const { error, actionGitPath } = await this.fetchGit(context, deviceWorkspacePath, actionId, gitPath);
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
    const shell = useSource ? true : false;
    this.logger.info('action run', { actionGitPath, runs_main, shell });
    return this.commandProcessRegistry.command(
      useSource ? 'yarn' : yarnPath,
      ['node', runs_main],
      {
        cwd: actionGitPath,
        env,
        shell,
      },
      context,
    );
  }
}
