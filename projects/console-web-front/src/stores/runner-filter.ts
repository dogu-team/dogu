import { DeviceConnectionState, ProjectId } from '@dogu-private/types';
import { create } from 'zustand';

import { FilterStore, filterUpdatorFunc } from './index';

export interface RunnerFilter {
  name: string;
  tags: string[];
  projects: { name: string; projectId: ProjectId }[];
  states: DeviceConnectionState[];
}

export const defaultRunnerFilterValue: RunnerFilter = {
  name: '',
  tags: [],
  projects: [],
  states: [],
};

interface RunnerFilterStore extends FilterStore<RunnerFilter> {}

const useRunnerFilterStore = create<RunnerFilterStore>((set, get) => ({
  filterValue: defaultRunnerFilterValue,
  updateFilter: (updator) => filterUpdatorFunc<RunnerFilter, RunnerFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultRunnerFilterValue }),
}));

export default useRunnerFilterStore;
