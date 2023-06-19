import { RoutinePipelineBase } from '@dogu-private/console';
import { create } from 'zustand';

export interface LivePipelineStore {
  pipeline: RoutinePipelineBase | null;
  setPipeline: (pipeline: RoutinePipelineBase | null) => void;
}

const useLivePipelineStore = create<LivePipelineStore>((set) => ({
  pipeline: null,
  setPipeline: (pipeline) => set({ pipeline }),
}));

export default useLivePipelineStore;
