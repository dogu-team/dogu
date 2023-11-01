import { CloudLicenseBase, SelfHostedLicenseBase, UserBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';
import styled from 'styled-components';

import { getCloudLicenseInServerSide, getSelfHostedLicenseInServerSide } from '../../enterprise/api/license';
import BillingInvoiceList from '../../src/components/billing/BillingInvoiceList';
import BillingPaymentMethod from '../../src/components/billing/BillingPaymentMethod';
import BillingSubscribedPlanDashboard from '../../src/components/billing/BillingSubscribedPlanDashboard';
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
  return (
    <Box>
      <Content>
        <TitleWrapper>
          <ContentTitle>Current plans</ContentTitle>
          <ContentInner>
            <BillingSubscribedPlanDashboard license={license} />
          </ContentInner>
        </TitleWrapper>
      </Content>
      <Content>
        <TitleWrapper>
          <ContentTitle>Payment method</ContentTitle>
        </TitleWrapper>
        <ContentInner>
          <BillingPaymentMethod />
        </ContentInner>
      </Content>
      <Content>
        <TitleWrapper>
          <ContentTitle>Invoices</ContentTitle>
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
