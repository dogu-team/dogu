import { CloudLicenseResponse, SelfHostedLicenseResponse } from '@dogu-private/console';
import { create } from 'zustand';

export interface LicenseStore {
  license: CloudLicenseResponse | SelfHostedLicenseResponse | null;
  updateLicense: (license: CloudLicenseResponse | SelfHostedLicenseResponse | null) => void;
}

const useLicenseStore = create<LicenseStore>((set) => ({
  license: null,
  updateLicense: (license) => set({ license }),
}));

export default useLicenseStore;
