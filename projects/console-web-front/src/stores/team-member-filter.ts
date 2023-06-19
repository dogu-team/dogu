import { create } from 'zustand';

import { FilterStore, filterUpdatorFunc } from '.';

export interface TeamMemberFilter {
  keyword: string;
}

export const defaultTeamMemberFilter: TeamMemberFilter = {
  keyword: '',
};

interface TeamMemberFilterStore extends FilterStore<TeamMemberFilter> {}

const useTeamMemberFilterStore = create<TeamMemberFilterStore>((set, get) => ({
  filterValue: defaultTeamMemberFilter,
  updateFilter: (updator) => filterUpdatorFunc<TeamMemberFilter, TeamMemberFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultTeamMemberFilter }),
}));

export default useTeamMemberFilterStore;
