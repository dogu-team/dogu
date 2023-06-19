import { create } from 'zustand';

import { FilterStore, filterUpdatorFunc } from '.';

export interface TeamProjectFilter {
  keyword: string;
}

export const defaultTeamProjectFilter: TeamProjectFilter = {
  keyword: '',
};

interface TeamProjectFilterStore extends FilterStore<TeamProjectFilter> {}

const useTeamProjectFilterStore = create<TeamProjectFilterStore>((set, get) => ({
  filterValue: defaultTeamProjectFilter,
  updateFilter: (updator) => filterUpdatorFunc<TeamProjectFilter, TeamProjectFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultTeamProjectFilter }),
}));

export default useTeamProjectFilterStore;
