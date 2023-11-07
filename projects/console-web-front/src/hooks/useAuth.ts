import { UserBase } from '@dogu-private/console';
import { useEffect } from 'react';
import useSWR from 'swr';

import { swrAuthFetcher } from 'src/api';
import useAuthStore from 'src/stores/auth';

const useAuth = (initialData?: UserBase) => {
  const updateMe = useAuthStore((state) => state.updateAuthStore);
  const { data, error, mutate, isLoading } = useSWR<UserBase>('/registery/check', swrAuthFetcher, {
    revalidateOnFocus: false,
    fallbackData: initialData,
  });

  useEffect(() => {
    if (data) {
      updateMe(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return {
    me: data ?? null,
    isLoading,
    error,
    mutate,
  };
};

export default useAuth;
