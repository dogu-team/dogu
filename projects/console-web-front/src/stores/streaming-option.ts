import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface CustomizedStreamingOption {
  fps: number;
  resolution: number;
  scrollSensitivity: number;
}

interface StreamingOptionStore {
  option: CustomizedStreamingOption;
  updateOption: (option: { [key in keyof CustomizedStreamingOption]?: CustomizedStreamingOption[key] }) => void;
}

const useStreamingOptionStore = create<StreamingOptionStore>()(
  persist(
    (set, get) => ({
      option: {
        fps: 60,
        resolution: 720,
        scrollSensitivity: 25,
      },
      updateOption: (option) => {
        const state = get();
        set({ option: { ...state.option, ...option } });
      },
    }),
    {
      name: 'streaming-option',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useStreamingOptionStore;
