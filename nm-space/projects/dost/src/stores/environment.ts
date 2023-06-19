import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface EnvironmentStore {
  platform: NodeJS.Platform | null;
  isDev: boolean;
  setEnvironment: (updates: Partial<Omit<EnvironmentStore, 'setPlatform'>>) => void;
}

const useEnvironmentStore = create<EnvironmentStore>()(
  persist(
    (set) => ({
      platform: null,
      isDev: false,
      setEnvironment: (updates) => set({ ...updates }),
    }),
    { name: 'environment-store', storage: createJSONStorage(() => localStorage) },
  ),
);

export default useEnvironmentStore;
