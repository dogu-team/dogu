import { create } from 'zustand';

import { FilterStore, filterUpdatorFunc } from '.';

export interface TagFilter {
  keyword: string;
}

export const defaultTagFilter: TagFilter = {
  keyword: '',
};

interface TagFilterStore extends FilterStore<TagFilter> {}

const useTagFilterStore = create<TagFilterStore>((set, get) => ({
  filterValue: defaultTagFilter,
  updateFilter: (updator) => filterUpdatorFunc<TagFilter, TagFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultTagFilter }),
}));

export default useTagFilterStore;
