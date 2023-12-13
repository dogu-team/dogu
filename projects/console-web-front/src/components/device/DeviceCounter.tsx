import { ExclamationCircleOutlined } from '@ant-design/icons';
import { GetEnabledDeviceCountResponse } from '@dogu-private/console';
import useSWR from 'swr';
import styled from 'styled-components';

import useRefresh from '../../hooks/useRefresh';
import useLicenseStore from '../../stores/license';
import { swrAuthFetcher } from '../../api';

const DeviceCounter: React.FC = () => {
  const license = useLicenseStore((state) => state.license);
  const { data: countInfo, mutate: mutateCountInfo } = useSWR<GetEnabledDeviceCountResponse>(
    !!license?.organizationId && `/organizations/${license.organizationId}/devices/count`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );

  useRefresh(['onDeviceAdded', 'onDeviceUpdated'], () => mutateCountInfo());

  if (!license) {
    return null;
  }

  const browserUsedCount = countInfo?.enabledBrowserCount ?? 0;
  const browserMaxCount = license.selfDeviceBrowserCount;

  const mobileUsedCount = countInfo?.enabledMobileCount ?? 0;
  const mobileMaxCount = license.selfDeviceMobileCount;

  const isBrowserMaxed = browserUsedCount >= browserMaxCount;
  const isMobileMaxed = mobileUsedCount >= mobileMaxCount;

  return (
    <FlexRow>
      <StyledText>
        {isBrowserMaxed && <ExclamationCircleOutlined style={{ color: 'red' }} />}&nbsp;Browsers: {browserUsedCount} /{' '}
        {browserMaxCount === Number.POSITIVE_INFINITY ? '∞' : browserMaxCount}
        &nbsp;&nbsp;&nbsp;{isMobileMaxed && <ExclamationCircleOutlined style={{ color: 'red' }} />}&nbsp;Devices:{' '}
        {mobileUsedCount} / {mobileMaxCount === Number.POSITIVE_INFINITY ? '∞' : mobileMaxCount}
      </StyledText>
    </FlexRow>
  );
};

export default DeviceCounter;

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledText = styled.p`
  line-height: 1.5;
  font-size: 0.8rem;
  color: ${(props) => props.theme.main.colors.gray2};
`;
