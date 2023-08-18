import { FeatureTableBase } from '@dogu-private/console';
import { createContext, useContext } from 'react';

export const FeatureContext = createContext<FeatureTableBase | null>(null);

const useFeatureContext = () => {
  const feature = useContext(FeatureContext);

  if (feature === undefined) {
    throw new Error('useFeatureConext must be used within FeatureContextProvider');
  }

  return feature;
};

export default useFeatureContext;
