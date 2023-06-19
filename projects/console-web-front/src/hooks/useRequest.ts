import { AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';

type RequestFunc<P extends any[], T> = (...args: P) => Promise<T>;

const useRequest = <P extends any[], T = AxiosResponse<void>>(func: RequestFunc<P, T>) => {
  const [loading, setLoading] = useState(false);

  const request = useCallback(
    async (...params: P) => {
      setLoading(true);
      try {
        const data = await func(...params);
        setLoading(false);
        return data;
      } catch (e) {
        setLoading(false);
        throw e;
      }
    },
    [func],
  );

  return [loading, request] as [boolean, typeof request];
};

export default useRequest;
