import { ProjectBase } from '@dogu-private/console';
import React, { useContext } from 'react';
import { KeyedMutator } from 'swr';

export interface ProjectContextProviderProps {
  project: ProjectBase | null;
  mutate: KeyedMutator<ProjectBase> | null;
}

export const ProjectContext = React.createContext<ProjectContextProviderProps>({
  project: null,
  mutate: null,
});

const useProjectContext = () => {
  const context = useContext(ProjectContext);

  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectContext');
  }

  return context;
};

export default useProjectContext;
