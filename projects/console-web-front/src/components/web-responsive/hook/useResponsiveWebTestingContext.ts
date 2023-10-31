import { Vendor } from '@dogu-private/device-data';
import { createContext, useContext } from 'react';

interface ResponsiveWebTestingContextProps {
  selectedVendors: Vendor[];
  setSelectedVendors: (vendors: Vendor[]) => void;
}

export const ResponsiveWebTestingContext = createContext<ResponsiveWebTestingContextProps>({
  selectedVendors: [],
  setSelectedVendors: (vendors: Vendor[]) => {},
});

const useResponsiveWebTestingContext = () => {
  const context = useContext(ResponsiveWebTestingContext);

  if (context === undefined) {
    throw new Error('useVendorContext must be used within a web-responsive prepare page');
  }

  return context;
};

export default useResponsiveWebTestingContext;
