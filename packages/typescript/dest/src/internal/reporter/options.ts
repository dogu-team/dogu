import { Printable } from '@dogu-tech/common';
import { EnvLoader } from '@dogu-tech/env-tools';
import lodash from 'lodash';
import { ReportEnv } from './env';

export type ReportOptions = ReportEnv;

export type FilledReportOptions = Required<ReportOptions>;

function defaultReportOptions(): FilledReportOptions {
  return {
    DOGU_ORGANIZATION_ID: '',
    DOGU_DEVICE_ID: '',
    DOGU_STEP_ID: '',
    DOGU_API_BASE_URL: '',
    DOGU_LOG_LEVEL: 'info',
    DOGU_HOST_TOKEN: '',
  };
}

export async function fillReportOptions(printable: Printable, options?: ReportOptions): Promise<FilledReportOptions> {
  const envLoader = new EnvLoader(ReportEnv, { printable });
  const env = await envLoader.load();
  return lodash.merge(defaultReportOptions(), env, options);
}
