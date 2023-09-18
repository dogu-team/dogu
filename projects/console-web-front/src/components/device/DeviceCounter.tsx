import { ExclamationCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { useDeviceCount } from '../../../enterprise/api/device';
import { COMMUNITY_MAX_BROWSER_COUNT, COMMUNITY_MAX_MOBILE_COUNT } from '../../../enterprise/utils/license';
import useOrganizationContext from '../../hooks/context/useOrganizationContext';
import useRefresh from '../../hooks/useRefresh';

const DeviceCounter: React.FC = () => {
  const { organization } = useOrganizationContext();
  const { data: countInfo, mutate: mutateCountInfo } = useDeviceCount();

  useRefresh(['onDeviceAdded', 'onDeviceUpdated'], () => mutateCountInfo());

  if (!organization) {
    return null;
  }

  const browserUsedCount = countInfo?.enabledBrowserCount ?? 0;
  const browserMaxCount =
    process.env.NEXT_PUBLIC_ENV === 'self-hosted'
      ? organization.licenseInfo?.licenseTier?.enabledBrowserCount ?? COMMUNITY_MAX_BROWSER_COUNT
      : Number.POSITIVE_INFINITY;

  const mobileUsedCount = countInfo?.enabledMobileCount ?? 0;
  const mobileMaxCount =
    process.env.NEXT_PUBLIC_ENV === 'self-hosted'
      ? organization.licenseInfo?.licenseTier?.enabledMobileCount ?? COMMUNITY_MAX_MOBILE_COUNT
      : Number.POSITIVE_INFINITY;

  const isBrowserMaxed = browserUsedCount >= browserMaxCount;
  const isMobileMaxed = mobileUsedCount >= mobileMaxCount;

  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    return (
      <FlexRow>
        <StyledText>
          {isBrowserMaxed && <ExclamationCircleOutlined style={{ color: 'red' }} />}&nbsp;Browsers: {browserUsedCount} /{' '}
          {browserMaxCount === Number.POSITIVE_INFINITY ? '∞' : browserMaxCount}
          &nbsp;&nbsp;&nbsp;{isMobileMaxed && <ExclamationCircleOutlined style={{ color: 'red' }} />}&nbsp;Devices:{' '}
          {mobileUsedCount} / {mobileMaxCount === Number.POSITIVE_INFINITY ? '∞' : mobileMaxCount}
        </StyledText>

        {/* {(isBrowserMaxed || isMobileMaxed) && (
        <a href={`${process.env.NEXT_PUBLIC_LANDING_URL}/pricing`} target="_blank">
          <Button type="primary" size="small">
            Upgrade plan
          </Button>
        </a>
      )} */}
      </FlexRow>
    );
  }

  return null;
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
