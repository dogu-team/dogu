import { stringify } from '@dogu-tech/common';
import { useCallback, useEffect, useState } from 'react';
import { DotEnvConfigKey } from '../shares/dot-env-config';

import { ExternalKey, ExternalValidationResult } from '../shares/external';
import { ipc } from '../utils/window';

export type ExternalToolInfo = {
  key: ExternalKey;
  name: string;
  envs: { key: DotEnvConfigKey; value: string }[];
  result: ExternalValidationResult | null;
  isManualInstallNeeded: boolean;
  isAgreementNeeded: boolean;
};

const usePlatformSupportedExternalInfo = () => {
  const [externalInfos, setExternalInfos] = useState<ExternalToolInfo[]>();

  const getExternalInfos = useCallback(async () => {
    try {
      const keys = await ipc.externalClient.getSupportedPlatformKeys();

      const externalToolInfos: ExternalToolInfo[] = [];

      for (const key of keys) {
        await ipc.externalClient.validate(key);
        const [name, envKeys] = await Promise.all([ipc.externalClient.getName(key), ipc.externalClient.getEnvKeys(key)]);
        const envValues = await Promise.all(envKeys.map((envKey) => ipc.externalClient.getEnvValue(key, envKey)));
        const validationResult = await ipc.externalClient.getLastValidationResult(key);
        const isAgreementNeeded = await ipc.externalClient.isAgreementNeeded(key);
        const isManualInstallNeeded = await ipc.externalClient.isManualInstallNeeded(key);
        const externalToolInfo: ExternalToolInfo = {
          key,
          name,
          envs: envKeys.map((envKey, i) => ({ key: envKey, value: envValues[i] })),
          result: validationResult,
          isManualInstallNeeded,
          isAgreementNeeded,
        };
        externalToolInfos.push(externalToolInfo);
      }

      setExternalInfos(externalToolInfos);
    } catch (e) {
      ipc.rendererLogger.error(`usePlatformSupportedExternalInfo: ${stringify(e)}`);
    }
  }, []);

  useEffect(() => {
    getExternalInfos();
  }, []);

  return { externalInfos, getExternalInfos };
};

export default usePlatformSupportedExternalInfo;
