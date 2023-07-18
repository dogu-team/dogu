import { OrganizationBase, ProjectBase } from '@dogu-private/console';
import React from 'react';

export interface OrganizationTutorialContextValue {
  organization: OrganizationBase | null;
  projects: ProjectBase[] | null;
}

const defaultContextValue: OrganizationTutorialContextValue = {
  organization: null,
  projects: null,
};

export const OrganizationTutorialContext = React.createContext<OrganizationTutorialContextValue>(defaultContextValue);

const useOrganizationTutorialContext = () => {
  const context = React.useContext(OrganizationTutorialContext);

  if (context === undefined) {
    throw new Error('useOrganizationTutorialContext must be used within a OrganizationTutorialContextProvider');
  }

  return context;
};

export default useOrganizationTutorialContext;
