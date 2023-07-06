import { OrganizationId } from '@dogu-private/types';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { swrAuthFetcher } from '../../api';
import { sendErrorNotification } from '../../utils/antd';
import TokenCopyInput from '../common/TokenCopyInput';

interface Props {
  organizationId: OrganizationId;
}

const ApiTokenButton = ({ organizationId }: Props) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data, isLoading, error } = useSWR<string>(shouldFetch && `/organizations/${organizationId}/api-token`, swrAuthFetcher, { revalidateOnFocus: false });

  useEffect(() => {
    if (error) {
      sendErrorNotification('Failed to get API token');
    }
  }, [error]);

  return data ? (
    <TokenCopyInput value={data} />
  ) : (
    <Button type="primary" loading={isLoading} onClick={() => setShouldFetch(true)}>
      Show API Token
    </Button>
  );
};

export default ApiTokenButton;
