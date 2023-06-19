import { create } from 'zustand';

import { FilterStore, filterUpdatorFunc } from '.';

export interface ProjectMemberFilter {
  keyword: string;
}

export const defaultProjectMemberFilter: ProjectMemberFilter = {
  keyword: '',
};

interface ProjectMemberFilterStore extends FilterStore<ProjectMemberFilter> {}

const useProjectMemberFilterStore = create<ProjectMemberFilterStore>((set, get) => ({
  filterValue: defaultProjectMemberFilter,
  updateFilter: (updator) => filterUpdatorFunc<ProjectMemberFilter, ProjectMemberFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultProjectMemberFilter }),
}));

export default useProjectMemberFilterStore;
