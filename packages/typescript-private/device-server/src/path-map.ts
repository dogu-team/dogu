import { PlatformAbility } from '@dogu-private/dost-children';
import { PathMap } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import fs from 'fs';

async function validatePathMap(pathMap: PathMap, platformAbility: PlatformAbility): Promise<void> {
  const paths: string[] = [];

  function addToPaths(internalPathMap: object): void {
    Object.keys(internalPathMap).map((key) => {
      const value = Reflect.get(internalPathMap, key) as unknown;
      if (typeof value !== 'string') {
        throw new Error(`path map validation failed: common.${key} is not string`);
      }
      paths.push(value);
    });
  }

  /**
   * @note currently linux platform's third party is installed from docker
   */
  if (!platformAbility.isLinuxEnabled) {
    addToPaths(pathMap.common);
  }

  if (platformAbility.isAndroidEnabled) {
    addToPaths(pathMap.android);
  }

  if (platformAbility.isIosEnabled) {
    addToPaths(pathMap.macos);
  }

  try {
    await Promise.all(paths.map((path) => fs.promises.stat(path)));
  } catch (error) {
    const casted = errorify(error);
    throw new Error(`path map validation failed`, { cause: casted });
  }
}

async function openPathMapInternal(androidHomePath: string, platformAbility: PlatformAbility): Promise<PathMap> {
  const thirdPartyPathMap = HostPaths.thirdParty.pathMap();
  const pathMap: PathMap = {
    ...thirdPartyPathMap,
    android: {
      adb: HostPaths.android.adbPath(androidHomePath),
    },
  };
  await validatePathMap(pathMap, platformAbility);
  return pathMap;
}

export type OpenPathMap = (androidHomePath: string, platformAbility: PlatformAbility) => Promise<PathMap>;
export type GetPathMap = () => PathMap;

export interface CreatePathMapProxyResult {
  openPathMap: OpenPathMap;
  pathMap: GetPathMap;
}

export function createPathMap(): CreatePathMapProxyResult {
  let instance: PathMap | null = null;
  const openPathMap: OpenPathMap = async (androidHomePath: string, platformAbility: PlatformAbility): Promise<PathMap> => {
    if (instance) {
      throw new Error('pathMap is already opened');
    }
    instance = await openPathMapInternal(androidHomePath, platformAbility);
    return instance;
  };
  return {
    openPathMap,
    pathMap: (): PathMap => {
      if (!instance) {
        throw new Error('pathMap is not opened');
      }
      return instance;
    },
  };
}

export const { openPathMap, pathMap } = createPathMap();
