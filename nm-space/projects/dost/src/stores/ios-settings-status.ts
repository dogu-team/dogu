import { useEffect } from 'react';
import { create } from 'zustand';
import useManualSetupExternalValidResult, { ManaulSetupExteranlValidResult } from '../hooks/manaul-setup-external-valid-result';
import { IosSettingsExternalKey } from '../shares/external';

type IosSettingIsValidStatus = ManaulSetupExteranlValidResult[];

export interface IosSettingsStatusStore {
  status: IosSettingIsValidStatus;
  setStatus: (status: IosSettingIsValidStatus) => void;
}

const useIosSettingsStatusStore = create<IosSettingsStatusStore>((set) => ({
  status: [],
  setStatus: (status: IosSettingIsValidStatus) => set({ status }),
}));

const useIosSettingsStatus = () => {
  const { results } = useManualSetupExternalValidResult(IosSettingsExternalKey);
  const iosStatus = useIosSettingsStatusStore((state) => state.status);
  const setIosStatus = useIosSettingsStatusStore((state) => state.setStatus);

  useEffect(() => {
    if (!results) {
      return;
    }
    setIosStatus(results);
  }, [results]);
  return { iosStatus, setIosStatus };
};

export default useIosSettingsStatus;
