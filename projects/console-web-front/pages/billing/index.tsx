import { CloudLicenseBase, SelfHostedLicenseBase, UserBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Button } from 'antd';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

import { getCloudLicenseInServerSide, getSelfHostedLicenseInServerSide } from '../../enterprise/api/license';
import BillingInvoiceList from '../../src/components/billing/BillingInvoiceList';
import BillingPaymentMethod from '../../src/components/billing/BillingPaymentMethod';
import BillingSubscribedPlanList from '../../src/components/billing/BillingSubscribedPlanList';
import UpgradePlanButton from '../../src/components/billing/UpgradePlanButton';
import LiveChat from '../../src/components/external/livechat';
import ConsoleBasicLayout from '../../src/components/layouts/ConsoleBasicLayout';
import Footer from '../../src/components/layouts/Footer';
import { checkLoginInServerSide } from '../../src/utils/auth';
import { NextPageWithLayout } from '../_app';

interface BillingPageProps {
  me: UserBase;
  license: CloudLicenseBase | SelfHostedLicenseBase;
}

const BillingPage: NextPageWithLayout<BillingPageProps> = ({ me, license }) => {
  const { t } = useTranslation('billing');

  return (
    <Box>
      <Content>
        <TitleWrapper>
          <ContentTitle>{t('currentPlanText')}</ContentTitle>
          <ContentInner>
            <BillingSubscribedPlanList license={license} />
          </ContentInner>
        </TitleWrapper>
        <div>
          <UpgradePlanButton license={license} groupType={null} type="primary">
            {t('upgradePlanButtonTitle')}
          </UpgradePlanButton>
          <Button danger type="text" style={{ marginLeft: '.5rem' }}>
            {t('cancelSubscriptionButtonTitle')}
          </Button>
        </div>
      </Content>
      <Content>
        <TitleWrapper>
          <ContentTitle>{t('billingPaymentMethodTitle')}</ContentTitle>
        </TitleWrapper>
        <ContentInner>
          <BillingPaymentMethod organizationId={license.organizationId as OrganizationId} />
        </ContentInner>
      </Content>
      <Content>
        <TitleWrapper>
          <ContentTitle>{t('billingInvoiceTitle')}</ContentTitle>
        </TitleWrapper>
        <ContentInner>
          <BillingInvoiceList />
        </ContentInner>
      </Content>
    </Box>
  );
};

BillingPage.getLayout = (page) => {
  return (
    <ConsoleBasicLayout user={page.props.me} licenseInfo={page.props.license}>
      {page}
      <Footer />
      <LiveChat />
    </ConsoleBasicLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const [me, license] = await Promise.all([
      checkLoginInServerSide(context),
      process.env.DOGU_RUN_TYPE === 'self-hosted'
        ? getSelfHostedLicenseInServerSide(context)
        : getCloudLicenseInServerSide(context),
    ]);

    return {
      props: {
        me,
        license,
      },
    };
  } catch (e) {}

  return {
    props: {},
  };
};

export default BillingPage;

const Box = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  line-height: 1.5;
  flex: 1;
`;

const Content = styled.section`
  margin-bottom: 2rem;
`;

const TitleWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const ContentTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ContentInner = styled.div`
  font-size: 0.9rem;
`;
