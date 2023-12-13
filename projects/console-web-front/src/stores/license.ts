import { CloudLicenseResponse } from '@dogu-private/console';
import { create } from 'zustand';

export interface LicenseStore {
  license: CloudLicenseResponse | null;
  updateLicense: (license: CloudLicenseResponse | null) => void;
}

const useLicenseStore = create<LicenseStore>((set) => ({
  license: null,
  updateLicense: (license) => set({ license }),
}));

export default useLicenseStore;
