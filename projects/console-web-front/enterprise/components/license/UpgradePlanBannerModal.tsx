import { CheckOutlined } from '@ant-design/icons';
import { SelfHostedLicenseBase } from '@dogu-private/console';
import { Button, Divider, Modal, Tag } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import styled from 'styled-components';

import useOrganizationContext from '../../../src/hooks/context/useOrganizationContext';
import { flexRowBaseStyle } from '../../../src/styles/box';
import { checkCommunityEdition, checkExpired } from '../../utils/license';

interface PricingItemProps {
  title: React.ReactNode;
  description: React.ReactNode;
  availableFeatures: string[];
  pricing: React.ReactNode;
  isCurrentPlan: boolean;
  button?: React.ReactNode;
}

const PricingItem: React.FC<PricingItemProps> = ({
  title,
  description,
  pricing,
  availableFeatures,
  isCurrentPlan,
  button,
}) => {
  const { t } = useTranslation('billing');

  return (
    <PricingItemBox>
      <FlexRow>
        <PricingTitle>{title}</PricingTitle>
        {isCurrentPlan && <Tag style={{ marginRight: '0', marginLeft: '.25rem' }}>{t('pricingCurrentPlan')}</Tag>}
      </FlexRow>
      <div style={{ marginTop: '.5rem' }}>
        <Description>{description}</Description>
      </div>
      <div style={{ marginTop: '.25rem' }}>
        <PricingText>{pricing}</PricingText>
      </div>
      <Divider />
      <div>
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

export const UpgradeDevicePlanBannerModal: React.FC<Props> = ({ isOpen, close, title, description }) => {
  const { license } = useOrganizationContext();
  const { t } = useTranslation('billing');
  const licenseInfo = license as SelfHostedLicenseBase | null;

  return (
    <Modal destroyOnClose open={isOpen} onCancel={close} closable title={title} footer={null} centered>
      <div>
        <p>{description}</p>
      </div>
      <PricingItemWrapper>
        {!licenseInfo || checkCommunityEdition(licenseInfo) || checkExpired(licenseInfo) ? (
          <>
            <PricingItem
              isCurrentPlan
              title={'Community'}
              pricing={t('pricingFree')}
              description={t('pricingCommunityDescription')}
              availableFeatures={[t('pricingCommunityDeviceFeature1'), t('pricingCommunityDeviceFeature2')]}
            />
            <PricingItem
              isCurrentPlan={false}
              title={'Professional'}
              description={t('pricingProDeviceDescription')}
              pricing={t('pricingPaid', { price: '29,000' })}
              availableFeatures={[
                t('pricingProDeviceFeature1', { count: 2 }),
                t('pricingProCommonFeature2'),
                t('pricingProCommonFeature3'),
              ]}
              button={
                <Link
                  href={`${process.env.NEXT_PUBLIC_LANDING_URL}/pricing?type=self-hosted&menu=mobile`}
                  target="_blank"
                  style={{ display: 'block' }}
                >
                  <Button type={'primary'} style={{ width: '100%' }}>
                    {t('upgradePlan')}
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
              description={t('pricingProDeviceDescription')}
              pricing={t('pricingPaid', { price: '29,000' })}
              availableFeatures={[
                t('pricingProDeviceFeature1', { count: licenseInfo?.maximumEnabledMobileCount ?? 2 }),
                t('pricingProCommonFeature2'),
                t('pricingProCommonFeature3'),
              ]}
              button={
                <Link
                  href={`${process.env.NEXT_PUBLIC_LANDING_URL}/pricing?type=self-hosted&menu=mobile`}
                  target="_blank"
                  style={{ display: 'block' }}
                >
                  <Button type={'primary'} style={{ width: '100%' }}>
                    {t('upgradePlan')}
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

export const UpgradeBrowserPlanModal: React.FC<Props> = ({ isOpen, close, title, description }) => {
  const { license } = useOrganizationContext();
  const { t } = useTranslation('billing');
  const licenseInfo = license as SelfHostedLicenseBase | null;

  return (
    <Modal destroyOnClose open={isOpen} onCancel={close} closable title={title} footer={null} centered>
      <div>
        <p>{description}</p>
      </div>
      <PricingItemWrapper>
        {!licenseInfo || checkCommunityEdition(licenseInfo) || checkExpired(licenseInfo) ? (
          <>
            <PricingItem
              isCurrentPlan
              title={'Community'}
              pricing={t('pricingFree')}
              description={t('pricingCommunityDescription')}
              availableFeatures={[t('pricingCommunityBrowserFeature1'), t('pricingCommunityBrowserFeature2')]}
            />
            <PricingItem
              isCurrentPlan={false}
              title={'Professional'}
              description={t('pricingProBrowserDescription')}
              pricing={t('pricingPaid', { price: '19,000' })}
              availableFeatures={[
                t('pricingProBrowserFeature1', { count: 2 }),
                t('pricingProCommonFeature2'),
                t('pricingProCommonFeature3'),
              ]}
              button={
                <Link
                  href={`${process.env.NEXT_PUBLIC_LANDING_URL}/pricing?type=self-hosted&menu=web`}
                  target="_blank"
                  style={{ display: 'block' }}
                >
                  <Button type={'primary'} style={{ width: '100%' }}>
                    {t('upgradePlan')}
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
              description={t('pricingProBrowserDescription')}
              pricing={t('pricingPaid', { price: '19,000' })}
              availableFeatures={[
                t('pricingProBrowserFeature1', { count: licenseInfo?.maximumEnabledBrowserCount ?? 2 }),
                t('pricingProCommonFeature2'),
                t('pricingProCommonFeature3'),
              ]}
              button={
                <Link
                  href={`${process.env.NEXT_PUBLIC_LANDING_URL}/pricing?type=self-hosted&menu=web`}
                  target="_blank"
                  style={{ display: 'block' }}
                >
                  <Button type={'primary'} style={{ width: '100%' }}>
                    {t('upgradePlan')}
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

export const UpgradeConveniencePlanModal: React.FC<Props> = ({ isOpen, close, title, description }) => {
  const { license } = useOrganizationContext();
  const { t } = useTranslation('billing');
  const licenseInfo = license as SelfHostedLicenseBase | undefined;

  return (
    <Modal destroyOnClose open={isOpen} onCancel={close} closable title={title} footer={null} centered>
      <div>
        <p>{description}</p>
      </div>
      <PricingItemWrapper>
        {!licenseInfo || checkCommunityEdition(licenseInfo) || checkExpired(licenseInfo) ? (
          <>
            <PricingItem
              isCurrentPlan
              title={'Community'}
              pricing={null}
              description={t('pricingCommunityDescription')}
              availableFeatures={[t('pricingCommunityCommonFeature1'), t('pricingCommunityCommonFeature2')]}
            />
            <PricingItem
              isCurrentPlan={false}
              title={'Professional'}
              pricing={null}
              description={t('pricingProCommonDescription')}
              availableFeatures={[
                t('pricingProCommonFeature1'),
                t('pricingProCommonFeature2'),
                t('pricingProCommonFeature3'),
              ]}
              button={
                <Link
                  href={`${process.env.NEXT_PUBLIC_LANDING_URL}/pricing?type=self-hosted`}
                  target="_blank"
                  style={{ display: 'block' }}
                >
                  <Button type={'primary'} style={{ width: '100%' }}>
                    {t('upgradePlan')}
                  </Button>
                </Link>
              }
            />
          </>
        ) : (
          <>
            <PricingItem
              isCurrentPlan={false}
              title={'Professional'}
              pricing={null}
              description={t('pricingProCommonDescription')}
              availableFeatures={[
                t('pricingProCommonFeature1'),
                t('pricingProCommonFeature2'),
                t('pricingProCommonFeature3'),
              ]}
              button={
                <Link
                  href={`${process.env.NEXT_PUBLIC_LANDING_URL}/pricing?type=self-hosted`}
                  target="_blank"
                  style={{ display: 'block' }}
                >
                  <Button type={'primary'} style={{ width: '100%' }}>
                    {t('upgradePlan')}
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
  word-break: keep-all;
`;
