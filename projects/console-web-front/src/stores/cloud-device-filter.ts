import { create } from 'zustand';

import { FilterStore, filterUpdatorFunc } from '.';

export interface CloudDeviceFilter {
  keyword: string;
}

export const defaultCloudDeviceFilter: CloudDeviceFilter = {
  keyword: '',
};

interface CloudDeviceFilterStore extends FilterStore<CloudDeviceFilter> {}

const useCloudDeviceFilterStore = create<CloudDeviceFilterStore>((set, get) => ({
  filterValue: defaultCloudDeviceFilter,
  updateFilter: (updator) => filterUpdatorFunc<CloudDeviceFilter, CloudDeviceFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultCloudDeviceFilter }),
}));

export default useCloudDeviceFilterStore;
