import { OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import React from 'react';

export interface TutorialContextValue {
  organization: OrganizationBase | null;
  project: ProjectBase | null;
  me: UserBase | null;
  updateProject: (project: ProjectBase) => void;
}

const defaultContextValue: TutorialContextValue = {
  organization: null,
  project: null,
  me: null,
  updateProject: () => {},
};

export const TutorialContext = React.createContext<TutorialContextValue>(defaultContextValue);

const useTutorialContext = () => {
  const context = React.useContext(TutorialContext);

  if (context === undefined) {
    throw new Error('useOrganizationTutorialContext must be used within a OrganizationTutorialContextProvider');
  }

  return context;
};

export default useTutorialContext;
