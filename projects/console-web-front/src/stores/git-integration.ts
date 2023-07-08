import { create } from 'zustand';

export interface GitIntegrationStore {
  isGitIntegrated: boolean;
  updateGitIntegrationStatus: (isGitIntegrated: boolean) => void;
}

const useGitIntegrationStore = create<GitIntegrationStore>((set, get) => ({
  isGitIntegrated: false,
  updateGitIntegrationStatus: (isGitIntegrated: boolean) => {
    set({ isGitIntegrated });
  },
}));

export default useGitIntegrationStore;
