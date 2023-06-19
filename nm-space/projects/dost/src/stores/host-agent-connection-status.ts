import { create } from 'zustand';
import { HostAgentConnectionStatus } from '../shares/child';

export interface HostAgentConnectionStatusStore {
  status: HostAgentConnectionStatus | null;
  setStatus: (status: HostAgentConnectionStatus) => void;
}

const useHostAgentConnectionStatusStore = create<HostAgentConnectionStatusStore>((set) => ({
  status: null,
  setStatus: (status) => set({ status }),
}));

export default useHostAgentConnectionStatusStore;
