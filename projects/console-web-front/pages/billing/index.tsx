import {
  CallBillingApiResponse,
  CloudLicenseBase,
  FindBillingMethodResponse,
  FindBillingMethodResultSuccess,
  SelfHostedLicenseBase,
  UserBase,
} from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

import { getCloudLicenseInServerSide, getSelfHostedLicenseInServerSide } from '../../enterprise/api/license';
import { getPaymentMethodsInServerSide } from '../../src/api/billing';
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
  paymentMethodsResponse: CallBillingApiResponse<FindBillingMethodResponse>;
}

const BillingPage: NextPageWithLayout<BillingPageProps> = ({ me, license, paymentMethodsResponse }) => {
  const { t } = useTranslation('billing');

  const hasRegisteredPaymentMethod = paymentMethodsResponse.body?.ok && paymentMethodsResponse.body.methods.length > 0;

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
        </div>
      </Content>
      {hasRegisteredPaymentMethod && (
        <Content>
          <TitleWrapper>
            <ContentTitle>{t('billingPaymentMethodTitle')}</ContentTitle>
          </TitleWrapper>
          <ContentInner>
            <BillingPaymentMethod
              methods={
                (paymentMethodsResponse as CallBillingApiResponse<FindBillingMethodResultSuccess>).body?.methods ?? []
              }
              organizationId={license.organizationId as OrganizationId}
            />
          </ContentInner>
        </Content>
      )}
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

export const getServerSideProps: GetServerSideProps<BillingPageProps> = async (context) => {
  try {
    const [me, license] = await Promise.all([
      checkLoginInServerSide(context),
      process.env.DOGU_RUN_TYPE === 'self-hosted'
        ? getSelfHostedLicenseInServerSide(context)
        : getCloudLicenseInServerSide(context),
    ]);
    const paymentMethods = await getPaymentMethodsInServerSide(context, {
      organizationId: license.organizationId as OrganizationId,
    });

    if (!me) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        me,
        license,
        paymentMethodsResponse: paymentMethods,
      },
    };
  } catch (e) {}

  return {
    notFound: true,
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
