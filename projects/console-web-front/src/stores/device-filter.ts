import { DeviceConnectionState, ProjectId } from '@dogu-private/types';
import { create } from 'zustand';
import { FilterStore, filterUpdatorFunc } from '.';

export interface DeviceFilter {
  name: string;
  tags: string[];
  projects: { name: string; projectId: ProjectId }[];
  states: DeviceConnectionState[];
}

export const defaultDeviceFilterValue: DeviceFilter = {
  name: '',
  tags: [],
  projects: [],
  states: [],
};

interface DeviceFilterStore extends FilterStore<DeviceFilter> {}

const useDeviceFilterStore = create<DeviceFilterStore>((set, get) => ({
  filterValue: defaultDeviceFilterValue,
  updateFilter: (updator) => filterUpdatorFunc<DeviceFilter, DeviceFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultDeviceFilterValue }),
}));

export default useDeviceFilterStore;
