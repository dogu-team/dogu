import { CheckOutlined } from '@ant-design/icons';
import { LICENSE_SELF_HOSTED_TIER_TYPE } from '@dogu-private/console';
import { Button, Divider, Modal, Tag } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';

import useOrganizationContext from '../../../src/hooks/context/useOrganizationContext';
import { flexRowBaseStyle } from '../../../src/styles/box';
import { checkExpired } from '../../utils/license';

interface PricingItemProps {
  title: React.ReactNode;
  description: React.ReactNode;
  availableFeatures: string[];
  pricing: React.ReactNode;
  isCurrentPlan: boolean;
  button?: React.ReactNode;
  maximumDeviceCount?: number;
}

const PricingItem: React.FC<PricingItemProps> = ({
  title,
  description,
  pricing,
  availableFeatures,
  isCurrentPlan,
  button,
  maximumDeviceCount,
}) => {
  return (
    <PricingItemBox>
      <FlexRow>
        <PricingTitle>{title}</PricingTitle>
        {isCurrentPlan && <Tag style={{ marginRight: '0', marginLeft: '.25rem' }}>Current Plan</Tag>}
      </FlexRow>
      <div style={{ marginTop: '.5rem' }}>
        <Description>{description}</Description>
      </div>
      <div style={{ marginTop: '.25rem' }}>
        <PricingText>{pricing}</PricingText>
      </div>
      <Divider />
      <div>
        {maximumDeviceCount && (
          <Description style={{ marginBottom: '.5rem' }}>
            Your current plan can enable up to <b>{maximumDeviceCount}</b> devices.
          </Description>
        )}
        {availableFeatures.map((feature) => (
          <FeatureContent key={feature}>
            <CheckOutlined style={{ marginRight: '.25rem', color: 'green' }} /> {feature}
          </FeatureContent>
        ))}
      </div>
      <div style={{ marginTop: '1rem' }}>{button}</div>
    </PricingItemBox>
  );
};

interface Props {
  isOpen: boolean;
  close: () => void;
  title: React.ReactNode;
  description: React.ReactNode;
}

const UpgradePlanBannerModal: React.FC<Props> = ({ isOpen, close, title, description }) => {
  const { organization } = useOrganizationContext();
  const licenseInfo = organization?.licenseInfo;

  return (
    <Modal destroyOnClose open={isOpen} onCancel={close} closable title={title} footer={null} centered>
      <div>
        <p>{description}</p>
      </div>
      <PricingItemWrapper>
        {!licenseInfo ||
        licenseInfo?.licenseTierId === LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community ||
        checkExpired(licenseInfo) ? (
          <>
            <PricingItem
              isCurrentPlan
              title={'Community'}
              pricing={'Free'}
              description={'For beginners'}
              availableFeatures={['Up to 3 devices', 'Web/Mobile App/Game test automation']}
            />
            <PricingItem
              isCurrentPlan={false}
              title={'Professional'}
              description={'Per device per month'}
              pricing={'31,000 KRW'}
              availableFeatures={['Enable more than 3 devices', 'Dogu Agent easy update', 'Open API for integration']}
              button={
                <Link
                  href={`${process.env.NEXT_PUBLIC_LANDING_URL}/pricing`}
                  target="_blank"
                  style={{ display: 'block' }}
                >
                  <Button type={'primary'} style={{ width: '100%' }}>
                    Upgrade plan
                  </Button>
                </Link>
              }
            />
          </>
        ) : (
          <>
            <PricingItem
              isCurrentPlan
              title={'Professional'}
              description={'Per device per month'}
              pricing={'31,000 KRW'}
              maximumDeviceCount={licenseInfo?.licenseTier?.deviceCount}
              availableFeatures={[
                `Enable more than ${licenseInfo?.licenseTier?.deviceCount ?? 3} devices`,
                'Dogu Agent easy update',
                'Open API for integration',
              ]}
              button={
                <Link
                  href={`${process.env.NEXT_PUBLIC_LANDING_URL}/pricing`}
                  target="_blank"
                  style={{ display: 'block' }}
                >
                  <Button type={'primary'} style={{ width: '100%' }}>
                    Upgrade plan
                  </Button>
                </Link>
              }
            />
          </>
        )}
      </PricingItemWrapper>
    </Modal>
  );
};

export default UpgradePlanBannerModal;

const PricingItemWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const PricingItemBox = styled.div`
  max-width: 350px;
  flex: 1;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 1rem;
  margin: 0 0.5rem;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const PricingTitle = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 600;
`;

const Description = styled.p`
  font-size: 0.8rem;
  line-height: 1.5;
  color: #666666;
`;

const PricingText = styled.p`
  font-size: 1.3rem;
  line-height: 1.5;
  font-weight: 600;
`;

const FeatureContent = styled.div`
  ${flexRowBaseStyle}
  margin: 0.25rem 0;
  font-size: 0.8rem;
  line-height: 1.5;
`;
