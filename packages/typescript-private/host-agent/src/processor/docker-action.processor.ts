import { DockerAction, ErrorResult } from '@dogu-private/console-host-agent';
import { ChildProcess } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { v4 } from 'uuid';
import { DoguLogger } from '../logger/logger';
import { MessageContext } from '../message/message.types';
import { StepMessageContext } from '../step/step.types';
import { ActionProcessor } from './action.processor';
import { CommandProcessRegistry } from './command.process-registry';

async function writeDockerEnvFile(env: Record<string, string | undefined>, workspacePath: string): Promise<void> {
  const envFilePath = path.resolve(workspacePath, '.env');
  const envArgs = _.entries(env)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`);
  await fs.promises.writeFile(envFilePath, envArgs.join('\n'));
}

function filterEnv(env: Record<string, string | undefined>): Record<string, string | undefined> {
  return _.entries(env)
    .filter(([key]) => key?.startsWith('DOGU_'))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

const localHostPattern = /.*(127\.0\.0\.1|localhost).*/g;
const dockerHost = 'host.docker.internal';

function replaceEnv(env: Record<string, string | undefined>): void {
  _.entries(env).forEach(([key, value]) => {
    if (value?.match(localHostPattern)) {
      env[key] = value.replaceAll('127.0.0.1', dockerHost).replaceAll('localhost', dockerHost);
    }
  });
}

@Injectable()
export class DockerActionProcessor {
  constructor(
    private readonly commandProcessRegistroy: CommandProcessRegistry,
    private readonly actionProcessor: ActionProcessor,
    private readonly logger: DoguLogger,
  ) {}

  /**
   * @note this is a temporary solution to run tests in docker. It will be replaced with a GCP Cloud Run solution.
   */
  async run(context: MessageContext, param: DockerAction): Promise<ErrorResult> {
    const { actionId, inputs } = param;
    const workspacePath = await this.actionProcessor.resolveWorkspacePath(context);
    const env = filterEnv(this.actionProcessor.resolveEnv(context, inputs));
    replaceEnv(env);
    await writeDockerEnvFile(env, workspacePath);

    const containerArgs = ['/bin/bash', '-c', `"cd ${actionId} && yarn node build/src/main.js"`];
    const containerName = context instanceof StepMessageContext ? `dogu-run-test-device-runner-${context.deviceRunnerId}` : `dogu-run-test-${v4()}`;
    const command = 'docker';
    const args = ['run', '--rm', '--name', containerName, '--env-file', '.env', '--add-host', 'host.docker.internal:host-gateway', 'dogu-run-test', ...containerArgs];
    this.logger.info(`Running docker command: ${command} ${args.join(' ')}`);
    this.logger.info(`Running docker command in workspace: ${workspacePath}`);
    return await this.commandProcessRegistroy.command(
      command,
      args,
      {
        cwd: workspacePath,
        shell: ChildProcess.defaultShell(),
      },
      context,
    );
  }
}
