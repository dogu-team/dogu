import { Printable } from '@dogu-tech/common';
import { DeviceHostClient } from '@dogu-tech/device-client';
import { HostPaths } from '@dogu-tech/node';
import { PlatformType } from '@dogu-tech/types';
import fs from 'fs';
import path from 'path';

import { Application } from '..';
import { ConsoleActionClient } from '../console-action-client';

export async function downloadApp(
  printable: Printable,
  consoleActionClient: ConsoleActionClient,
  deviceHostClient: DeviceHostClient,
  DOGU_DEVICE_PLATFORM: PlatformType,
  DOGU_HOST_WORKSPACE_PATH: string,
  by: { appVersion?: string; appPackageName?: string },
): Promise<string> {
  function getExtension(platform: PlatformType): string {
    switch (platform) {
      case 'android':
        return 'apk';
      case 'ios':
        return 'ipa';
      default:
        throw new Error(`Invalid platform: ${platform}`);
    }
  }

  const extension = getExtension(DOGU_DEVICE_PLATFORM);
  printable.info('Get application list for', {
    version: by.appVersion,
    packageName: by.appPackageName,
    extension,
  });

  let application: Application | undefined;
  if (by.appPackageName) {
    const { applications: apps } = await consoleActionClient.getApplicationsWithUniquePackage({
      extension,
    });
    application = apps.find((app) => app.packageName === by.appPackageName);
  } else if (by.appVersion) {
    const { applications: apps } = await consoleActionClient.getApplicationList({
      version: by.appVersion,
      extension,
    });
    application = apps[0];
  }

  if (application === undefined) {
    throw new Error(
      `No application found for ${
        by.appPackageName ? `appPackageName ${by.appPackageName}` : by.appVersion ? `appVersion ${by.appVersion}` : 'empty condition'
      } and extension ${extension}`,
    );
  }

  printable.info('Get application download url', {
    application,
  });
  const { fileName, fileSize } = application;
  const { url } = await consoleActionClient.getApplicationDownloadUrl(application.id);
  const hostSharesPath = HostPaths.hostSharesPath(DOGU_HOST_WORKSPACE_PATH);
  const filePath = path.resolve(hostSharesPath, fileName);
  printable.info('Download application', {
    url,
    filePath,
  });
  await deviceHostClient.downloadSharedResource(filePath, url, fileSize);
  printable.info('Downloaded application', {
    url,
    filePath,
  });
  const stat = await fs.promises.stat(filePath);
  if (fileSize !== stat.size) {
    throw new Error(`Downloaded file size mismatch. Expected: ${fileSize}, actual: ${stat.size}`);
  }
  return filePath;
}
