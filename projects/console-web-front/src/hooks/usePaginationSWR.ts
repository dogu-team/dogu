import { PageBase } from '@dogu-private/console';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { swrAuthFetcher } from 'src/api';
import useSWR, { SWRConfiguration } from 'swr';

export interface PaginationSWROption {
  offset?: number;
  skipQuestionMark?: boolean;
}

const getPaginationQuery = (page: number, offset: number = 10) => {
  const sp = new URLSearchParams();
  sp.append('page', page.toString());
  sp.append('offset', offset.toString());

  return sp.toString();
};

const usePaginationSWR = <D>(
  key: string | null,
  option?: PaginationSWROption,
  swrConfig?: SWRConfiguration<PageBase<D>>,
) => {
  const [page, setPage] = useState(1);
  const [swrKey, setSWRKey] = useState<string | null>();
  const pageQuery = useMemo(() => getPaginationQuery(page, option?.offset), [page, option?.offset]);
  const { data, error, mutate, isLoading, isValidating } = useSWR<PageBase<D>>(swrKey, swrAuthFetcher, {
    keepPreviousData: true,
    ...swrConfig,
  });

  useEffect(() => {
    // NOTE: 키 변경 시 페이지 초기화
    if (page !== 1) {
      setPage(1);
    } else {
      setSWRKey(key && `${key}${option?.skipQuestionMark ? `&${pageQuery}` : `?${pageQuery}`}`);
    }
  }, [key]);

  useEffect(() => {
    // 페이지 변경시 SWR key 만들기
    setSWRKey(key && `${key}${option?.skipQuestionMark ? `&${pageQuery}` : `?${pageQuery}`}`);
  }, [page]);

  const updatePage = useCallback((p: number) => {
    setPage(p);
  }, []);

  return { data, error, mutate, page, updatePage, isLoading, isValidating };
};

export default usePaginationSWR;
