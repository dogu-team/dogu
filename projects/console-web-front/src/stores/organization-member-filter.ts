import { create } from 'zustand';

import { FilterStore, filterUpdatorFunc } from './index';

export interface OrganizationMemberFilter {
  keyword: string;
}

export const defaultOrganizationMemberFilter: OrganizationMemberFilter = {
  keyword: '',
};

interface OrganizationMemberFilterStore extends FilterStore<OrganizationMemberFilter> {}

const useOrganizationMemberFilterStore = create<OrganizationMemberFilterStore>((set, get) => ({
  filterValue: defaultOrganizationMemberFilter,
  updateFilter: (updator) => filterUpdatorFunc<OrganizationMemberFilter, OrganizationMemberFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultOrganizationMemberFilter }),
}));

export default useOrganizationMemberFilterStore;
