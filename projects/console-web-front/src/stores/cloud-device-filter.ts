import { FindCloudDevicesDtoBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import { create } from 'zustand';

import { FilterStore, filterUpdatorFunc } from '.';

export interface CloudDeviceFilter extends Omit<Required<FindCloudDevicesDtoBase>, 'page' | 'offset'> {}

export const defaultCloudDeviceFilter: CloudDeviceFilter = {
  keyword: '',
  platform: Platform.PLATFORM_UNSPECIFIED,
  version: '',
};

interface CloudDeviceFilterStore extends FilterStore<CloudDeviceFilter> {}

const useCloudDeviceFilterStore = create<CloudDeviceFilterStore>((set, get) => ({
  filterValue: defaultCloudDeviceFilter,
  updateFilter: (updator) => filterUpdatorFunc<CloudDeviceFilter, CloudDeviceFilterStore>(updator, set, get),
  resetFilter: () => set({ filterValue: defaultCloudDeviceFilter }),
}));

export default useCloudDeviceFilterStore;
