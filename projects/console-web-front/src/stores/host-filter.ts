import { create } from 'zustand';

import { FilterStore, filterUpdatorFunc } from '.';

export interface HostFilter {
  keyword: string;
}

export const defaultHostFilter: HostFilter = {
  keyword: '',
};

interface HostFilterStore extends FilterStore<HostFilter> {}

const useHostFilterStore = create<HostFilterStore>((set, get) => ({
  filterValue: defaultHostFilter,
  updateFilter: (updator) => filterUpdatorFunc<HostFilter, HostFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultHostFilter }),
}));

export default useHostFilterStore;
