import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  SelfHostedLicenseResponse,
  COMMUNITY_MAX_BROWSER_COUNT,
  COMMUNITY_MAX_MOBILE_COUNT,
} from '@dogu-private/console';
import styled from 'styled-components';

import { useDeviceCount } from '../../../enterprise/api/device';
import { checkExpired } from '../../../enterprise/utils/license';
import useRefresh from '../../hooks/useRefresh';
import useLicenseStore from '../../stores/license';

const DeviceCounter: React.FC = () => {
  const license = useLicenseStore((state) => state.license);
  const { data: countInfo, mutate: mutateCountInfo } = useDeviceCount();

  useRefresh(['onDeviceAdded', 'onDeviceUpdated'], () => mutateCountInfo());

  if (!license) {
    return null;
  }

  const getbrowserMaxCount = () => {
    if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
      if (checkExpired(license as SelfHostedLicenseResponse)) {
        return COMMUNITY_MAX_BROWSER_COUNT;
      }
      return (license as SelfHostedLicenseResponse)?.maximumEnabledBrowserCount ?? COMMUNITY_MAX_BROWSER_COUNT;
    } else {
      return Number.POSITIVE_INFINITY;
    }
  };

  const getMobileMaxCount = () => {
    if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
      if (checkExpired(license as SelfHostedLicenseResponse)) {
        return COMMUNITY_MAX_MOBILE_COUNT;
      }
      return (license as SelfHostedLicenseResponse)?.maximumEnabledBrowserCount ?? COMMUNITY_MAX_MOBILE_COUNT;
    } else {
      return Number.POSITIVE_INFINITY;
    }
  };

  const browserUsedCount = countInfo?.enabledBrowserCount ?? 0;
  const browserMaxCount = getbrowserMaxCount();

  const mobileUsedCount = countInfo?.enabledMobileCount ?? 0;
  const mobileMaxCount = getMobileMaxCount();

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
