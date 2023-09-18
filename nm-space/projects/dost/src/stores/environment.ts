import { FeatureTable } from '@dogu-private/dogu-agent-core';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppConfigTable } from '../shares/app-config';

export interface EnvironmentStore {
  platform: NodeJS.Platform | null;
  isDev: boolean;
  isShowDevUI: boolean;
  features: FeatureTable;
  appConfig: AppConfigTable;
  setEnvironment: (updates: Partial<Omit<EnvironmentStore, 'setEnvironment'>>) => void;
}

const useEnvironmentStore = create<EnvironmentStore>()(
  persist(
    (set) => ({
      platform: null,
      isDev: false,
      isShowDevUI: true,
      features: {
        showApiUrlInput: false,
        useSentry: false,
        useAppUpdate: false,
        showTLSAuthReject: false,
      },
      appConfig: {},
      setEnvironment: (updates) => set({ ...updates }),
    }),
    { name: 'environment-store', storage: createJSONStorage(() => localStorage) },
  ),
);

export default useEnvironmentStore;
