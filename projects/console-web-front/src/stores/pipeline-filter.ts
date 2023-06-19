import { PIPELINE_STATUS } from '@dogu-private/types';
import { create } from 'zustand';

import { FilterStore, filterUpdatorFunc } from '.';

export interface PipelineFilter {
  status: PIPELINE_STATUS[];
}

export const defaultPipelineFilter: PipelineFilter = {
  status: [],
};

interface PipelineFilterStore extends FilterStore<PipelineFilter> {}

const usePipelineFilterStore = create<PipelineFilterStore>((set, get) => ({
  filterValue: defaultPipelineFilter,
  updateFilter: (updator) => filterUpdatorFunc<PipelineFilter, PipelineFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultPipelineFilter }),
}));

export default usePipelineFilterStore;
