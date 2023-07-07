import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppConfigTable } from '../shares/app-config';
import { FeatureTable } from '../shares/feature-config';

export interface EnvironmentStore {
  platform: NodeJS.Platform | null;
  isDev: boolean;
  features: FeatureTable;
  appConfig: AppConfigTable;
  setEnvironment: (updates: Partial<Omit<EnvironmentStore, 'setEnvironment'>>) => void;
}

const useEnvironmentStore = create<EnvironmentStore>()(
  persist(
    (set) => ({
      platform: null,
      isDev: false,
      features: {
        useApiUrlInput: false,
        useSentry: false,
        useAppUpdate: false,
      },
      appConfig: {},
      setEnvironment: (updates) => set({ ...updates }),
    }),
    { name: 'environment-store', storage: createJSONStorage(() => localStorage) },
  ),
);

export default useEnvironmentStore;
