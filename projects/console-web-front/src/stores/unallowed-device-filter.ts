import { create } from 'zustand';

import { FilterStore, filterUpdatorFunc } from '.';

export interface UnallowedDeviceFilter {
  name: string;
}

export const defaultUnallowedDeviceFilter: UnallowedDeviceFilter = {
  name: '',
};

interface UnallowedDeviceFilterStore extends FilterStore<UnallowedDeviceFilter> {}

const useUnallowedDeviceFilterStore = create<UnallowedDeviceFilterStore>((set, get) => ({
  filterValue: defaultUnallowedDeviceFilter,
  updateFilter: (updator) => filterUpdatorFunc<UnallowedDeviceFilter, UnallowedDeviceFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultUnallowedDeviceFilter }),
}));

export default useUnallowedDeviceFilterStore;
