import { create } from 'zustand';
import { FilterStore, filterUpdatorFunc } from '.';

export interface TeamFilter {
  keyword: string;
}

export const defaultTeamFilter: TeamFilter = {
  keyword: '',
};

interface TeamFilterStore extends FilterStore<TeamFilter> {}

const useTeamFilterStore = create<TeamFilterStore>((set, get) => ({
  filterValue: defaultTeamFilter,
  updateFilter: (updator) => filterUpdatorFunc<TeamFilter, TeamFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultTeamFilter }),
}));

export default useTeamFilterStore;
