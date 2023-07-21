import { UserId } from '@dogu-private/types';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api/index';
import { sendErrorNotification } from '../../utils/antd';
import TokenCopyInput from '../common/TokenCopyInput';

interface Props {
  userId: UserId;
}

const AcessTokenButton = ({ userId }: Props) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data, isLoading, error } = useSWR<string>(shouldFetch && `/users/${userId}/access-token`, swrAuthFetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error) {
      sendErrorNotification('Failed to get API token');
    }
  }, [error]);

  return data ? (
    <TokenCopyInput value={data} />
  ) : (
    <Button type="primary" loading={isLoading} onClick={() => setShouldFetch(true)}>
      Show token
    </Button>
  );
};

export default AcessTokenButton;
