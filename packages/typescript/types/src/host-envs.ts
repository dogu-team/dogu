export interface StepContextEnv extends Record<string, string | undefined> {
  CI: string;
  DOGU_API_BASE_URL: string;
  DOGU_DEVICE_ID: string;
  DOGU_DEVICE_JOB_ID: string;
  DOGU_DEVICE_PLATFORM: string;
  DOGU_DEVICE_SERIAL: string;
  DOGU_DEVICE_SERVER_PORT: string;
  DOGU_DEVICE_WORKSPACE_PATH: string;
  DOGU_ROUTINE_WORKSPACE_PATH: string;
  DOGU_HOST_PLATFORM: string;
  DOGU_HOST_WORKSPACE_PATH: string;
  DOGU_LOG_LEVEL: string;
  DOGU_ORGANIZATION_ID: string;
  DOGU_ORGANIZATION_WORKSPACE_PATH: string;
  DOGU_PROJECT_ID: string;
  DOGU_ROOT_WORKSPACE_PATH: string;
  DOGU_RUN_TYPE: string;
  DOGU_STEP_ID: string;
  DOGU_STEP_WORKING_PATH: string;
  DOGU_HOST_TOKEN: string;
  PATH: string;

  // job level variables
  DOGU_APP_VERSION: string;
  DOGU_BROWSER_NAME: string;
  DOGU_BROWSER_VERSION: string;
}

export function createConsoleApiAuthHeader(DOGU_HOST_TOKEN: string): {
  headers: {
    Authorization: string;
  };
} {
  return {
    headers: {
      Authorization: `Bearer ${DOGU_HOST_TOKEN}`,
    },
  };
}

export interface ActionContextEnv extends Record<string, string | undefined> {
  DOGU_ACTION_INPUTS: string;
}
