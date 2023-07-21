import { EnvLoader } from '@dogu-tech/env-tools';
import lodash from 'lodash';
import { ActionKitEnv } from './env';

export type ActionKitOptions = ActionKitEnv;

export type FilledActionKitOptions = Required<ActionKitOptions>;

function defaultActionKitOptions(): FilledActionKitOptions {
  return {
    DOGU_ACTION_INPUTS: '',
    DOGU_API_BASE_URL: '',
    DOGU_DEVICE_ID: '',
    DOGU_DEVICE_PLATFORM: 'unspecified',
    DOGU_DEVICE_SERIAL: '',
    DOGU_DEVICE_SERVER_PORT: '',
    DOGU_DEVICE_WORKSPACE_PATH: '',
    DOGU_ROUTINE_WORKSPACE_PATH: '',
    DOGU_HOST_PLATFORM: 'unspecified',
    DOGU_HOST_WORKSPACE_PATH: '',
    DOGU_ORGANIZATION_ID: '',
    DOGU_ORGANIZATION_WORKSPACE_PATH: '',
    DOGU_PROJECT_ID: '',
    DOGU_REQUEST_TIMEOUT: 60000,
    DOGU_LOG_LEVEL: 'info',
    DOGU_LOG_TO_FILE: false,
    DOGU_RUN_TYPE: '',
    DOGU_HOST_TOKEN: '',
  };
}

export async function fillActionKitOptions(options?: ActionKitOptions): Promise<FilledActionKitOptions> {
  const env = await new EnvLoader(ActionKitEnv).load();
  return lodash.merge(defaultActionKitOptions(), env, options);
}
