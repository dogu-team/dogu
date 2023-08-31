import { OrganizationBase } from '@dogu-private/console';
import React, { useContext } from 'react';
import { KeyedMutator } from 'swr';

export interface OrganizationContextProviderProps {
  organization: OrganizationBase | null;
  mutate: KeyedMutator<OrganizationBase> | null;
}

export const OrganizationContext = React.createContext<OrganizationContextProviderProps>({ organization: null, mutate: null });

const useOrganizationContext = () => {
  const context = useContext(OrganizationContext);

  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within a OrganizationContext');
  }

  return context;
};

export default useOrganizationContext;
