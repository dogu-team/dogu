import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';
import { useDeviceCount } from '../../../enterprise/api/device';
import useOrganizationContext from '../../hooks/context/useOrganizationContext';
import useRefresh from '../../hooks/useRefresh';

const COMMUNITY_MAX_BROWSER_COUNT = 2;
const COMMUNITY_MAX_MOBILE_COUNT = 2;

const DeviceCounter: React.FC = () => {
  const { organization } = useOrganizationContext();
  const { data: countInfo, mutate: mutateCountInfo } = useDeviceCount();

  useRefresh(['onDeviceAdded', 'onDeviceUpdated'], () => mutateCountInfo());

  if (!organization) {
    return null;
  }

  const browserUsedCount = countInfo?.enabledBrowserCount ?? 0;
  const browserMaxCount = organization.licenseInfo?.licenseTier?.enabledBrowserCount ?? COMMUNITY_MAX_BROWSER_COUNT;

  const mobileUsedCount = countInfo?.enabledMobileCount ?? 0;
  const mobileMaxCount = organization.licenseInfo?.licenseTier?.enabledMobileCount ?? COMMUNITY_MAX_MOBILE_COUNT;

  const isBrowserMaxed = browserUsedCount >= browserMaxCount;
  const isMobileMaxed = mobileUsedCount >= mobileMaxCount;

  return (
    <FlexRow>
      <StyledText>
        {isBrowserMaxed && <ExclamationCircleOutlined style={{ color: 'red' }} />}&nbsp;Browsers: {browserUsedCount} /{' '}
        {browserMaxCount}
        &nbsp;&nbsp;&nbsp;{isMobileMaxed && <ExclamationCircleOutlined style={{ color: 'red' }} />}&nbsp;Devices:{' '}
        {countInfo?.enabledMobileCount} / {organization.licenseInfo?.licenseTier?.enabledMobileCount}
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
