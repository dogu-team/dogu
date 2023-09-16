import { BrowserName, isAllowedBrowserName, JobSchema, Platform, platformTypeFromPlatform } from '@dogu-private/types';
import _ from 'lodash';

export type Pickable = string;

export interface RunsOnPickOne {
  type: 'pickOne';
  pickables: Pickable[];
}

export interface RunOnPickAll {
  type: 'pickAll';
  pickables: Pickable[];
}

export type RunsOn = RunsOnPickOne | RunOnPickAll;

export class ParseRunsOnError extends Error {
  constructor(message: string, readonly jobName: string, readonly runsOnRaw: JobSchema['runs-on'], options?: ErrorOptions) {
    super(message, options);
  }
}

export function parseRunsOn(jobName: string, runsOnRaw: JobSchema['runs-on']): RunsOn {
  if (typeof runsOnRaw === 'string' || Array.isArray(runsOnRaw)) {
    const pickables = typeof runsOnRaw === 'string' ? [runsOnRaw] : runsOnRaw;
    if (_.uniq(pickables).length !== pickables.length) {
      throw new ParseRunsOnError(`Duplicated pickables [${pickables}] on job [${jobName}]`, jobName, runsOnRaw);
    }

    return { type: 'pickOne', pickables };
  }

  if (typeof runsOnRaw === 'object') {
    if (!('group' in runsOnRaw)) {
      throw new ParseRunsOnError(`Missing group on runs-on [${runsOnRaw}] on job [${jobName}]`, jobName, runsOnRaw);
    }

    if (_.keys(runsOnRaw).filter((key) => key !== 'group').length > 0) {
      throw new ParseRunsOnError(`Unknown keys [${_.keys(runsOnRaw).filter((key) => key !== 'group')}] on runs-on [${runsOnRaw}] on job [${jobName}]`, jobName, runsOnRaw);
    }

    const { group } = runsOnRaw;
    const pickables = typeof group === 'string' ? [group] : group;
    if (_.uniq(pickables).length !== pickables.length) {
      throw new ParseRunsOnError(`Duplicated pickables [${pickables}] on job [${jobName}]`, jobName, runsOnRaw);
    }

    return { type: 'pickAll', pickables };
  }

  throw new ParseRunsOnError(`Invalid runs-on [${runsOnRaw}] on job [${jobName}]`, jobName, runsOnRaw);
}

export function parseAppVersion(appVersionRaw: JobSchema['appVersion'], platform: Platform): string | null {
  if (appVersionRaw) {
    if (typeof appVersionRaw === 'string') {
      return appVersionRaw;
    } else if (typeof appVersionRaw === 'object') {
      const platformType = platformTypeFromPlatform(platform);
      const appVersion = appVersionRaw[platformType];
      if (appVersion) {
        return appVersion;
      }
    }
  }
  return null;
}

export function parseAppPackageName(appPackageNameRaw: JobSchema['appPackageName'], platform: Platform): string | null {
  if (appPackageNameRaw) {
    if (typeof appPackageNameRaw === 'string') {
      return appPackageNameRaw;
    } else if (typeof appPackageNameRaw === 'object') {
      const platformType = platformTypeFromPlatform(platform);
      const appPackageName = appPackageNameRaw[platformType];
      if (appPackageName) {
        return appPackageName;
      }
    }
  }
  return null;
}

export function parseBrowserName(browserNameRaw?: string): BrowserName | undefined {
  if (browserNameRaw && isAllowedBrowserName(browserNameRaw)) {
    return browserNameRaw;
  }
  return undefined;
}
