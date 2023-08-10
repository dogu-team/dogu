import { stringify } from '@dogu-tech/common';
import { useCallback, useEffect, useState } from 'react';
import { ExternalKey } from '../shares/external';
import { ipc } from '../utils/window';

export type ManaulSetupExteranlValidResult = {
  key: ExternalKey;
  name: string;
  isValid: boolean;
  error: Error | null;
};

const useManualSetupExternalValidResult = (filterKeys: readonly string[] = []) => {
  const [infos, setInfos] = useState<ManaulSetupExteranlValidResult[]>();
  const [loading, setLoading] = useState<boolean>(false);

  const validate = useCallback(async () => {
    setLoading(true);
    try {
      const keys = await ipc.externalClient.getSupportedPlatformKeys();

      const neededKeys: ManaulSetupExteranlValidResult[] = [];
      for (const key of keys) {
        if (0 < filterKeys.length && !filterKeys.includes(key)) {
          continue;
        }
        const isManualInstallNeeded = await ipc.externalClient.isManualInstallNeeded(key);
        const name = await ipc.externalClient.getName(key);
        const result = await ipc.externalClient.isValid(key);

        if (isManualInstallNeeded) {
          neededKeys.push({ key, name, isValid: result.valid, error: result.error });
        }
      }

      setInfos(neededKeys);
    } catch (e) {
      ipc.rendererLogger.error(`useManualSetupExternal error: ${stringify(e)}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    validate();
  }, []);

  return { results: infos, loading, validate };
};

export default useManualSetupExternalValidResult;
