import { create } from 'zustand';

export interface TryConnectStore {
  isFirstTried: boolean;
  setIsFirstTried: (isFirstTried: boolean) => void;
}

const useTryStore = create<TryConnectStore>((set) => ({
  isFirstTried: false,
  setIsFirstTried: (isFirstTried: boolean) => set({ isFirstTried }),
}));

export default useTryStore;
