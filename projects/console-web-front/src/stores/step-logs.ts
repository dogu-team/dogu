import { TestLogResponse } from '@dogu-private/console';
import { create } from 'zustand';

interface StepLogsState {
  // change to DeviceJobLogResponse[] after console-web-server is updated
  // need to change
  logs: TestLogResponse[];
  updateLogs: (logs: TestLogResponse[]) => void;
  resetLogs: () => void;
}

const useStepLogsStore = create<StepLogsState>((set, get) => ({
  logs: [],
  updateLogs: (logs) => {
    set((prev) => {
      return {
        logs: [...prev.logs, ...logs],
      };
    });
  },
  resetLogs: () => {
    set({ logs: [] });
  },
}));

export default useStepLogsStore;
