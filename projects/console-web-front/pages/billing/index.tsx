import { LoadingOutlined } from '@ant-design/icons';
import { CloudLicenseResponse, SelfHostedLicenseResponse, UserBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import styled from 'styled-components';

import { getLicenseInServerSide } from '../../enterprise/api/license';
import BillingHistoryList from '../../src/components/billing/BillingHistoryList';
import BillingPaddleAddress from '../../src/components/billing/BillingPaddleAddress';
import BillingPaddleBusiness from '../../src/components/billing/BillingPaddleBusiness';
import BillingPaymentMethodNice from '../../src/components/billing/BillingPaymentMethodNice';
import BillingSubscribedPlanList from '../../src/components/billing/BillingSubscribedPlanList';
import UpgradePlanButton from '../../src/components/billing/UpgradePlanButton';
import LiveChat from '../../src/components/external/livechat';
import ConsoleBasicLayout from '../../src/components/layouts/ConsoleBasicLayout';
import Footer from '../../src/components/layouts/Footer';
import useLicenseStore from '../../src/stores/license';
import { checkUserVerifiedInServerSide } from '../../src/utils/auth';
import { NextPageWithLayout } from '../_app';

interface BillingPageProps {
  me: UserBase;
  license: CloudLicenseResponse | SelfHostedLicenseResponse;
}

const BillingPage: NextPageWithLayout<BillingPageProps> = ({ me, license }) => {
  const { t } = useTranslation('billing');
  const storedLicense = useLicenseStore((state) => state.license);

  if (!storedLicense) {
    return (
      <>
        <Head>
          <title>Plans & Pricing | Dogu</title>
        </Head>
        <Box>
          <div>
            <LoadingOutlined />
          </div>
        </Box>
      </>
    );
  }

  const paymentMethod = (storedLicense as CloudLicenseResponse | null)?.billingOrganization?.billingMethodNice;

  return (
    <>
      <Head>
        <title>Plans & Pricing | Dogu</title>
      </Head>
      <Box>
        <Content>
          <TitleWrapper>
            <ContentTitle>{t('currentPlanText')}</ContentTitle>
            <div style={{ marginBottom: '.5rem' }}>
              <UpgradePlanButton groupType={null} type="primary">
                {t('upgradePlanButtonTitle')}
              </UpgradePlanButton>
            </div>
            <ContentInner>
              <BillingSubscribedPlanList />
            </ContentInner>
          </TitleWrapper>
        </Content>
        {!!license.billingOrganization.billingMethod !== null && (
          <Content>
            <TitleWrapper>
              <ContentTitle>
                {t(
                  license.billingOrganization.billingMethod === 'nice'
                    ? 'billingPaymentMethodTitle'
                    : 'billingInfomationTitle',
                )}
              </ContentTitle>
            </TitleWrapper>
            <ContentInner>
              {license.billingOrganization.billingMethod === 'nice' ? (
                <BillingPaymentMethodNice
                  method={license.billingOrganization.billingMethodNice!}
                  organizationId={license.organizationId as OrganizationId}
                />
              ) : (
                <div>
                  <p style={{ fontSize: '.8rem', color: '#777' }}>* {t('changePaddlePaymentMethodInfoMessage')}</p>

                  <BillingInfoWrapper>
                    <BillingPaddleAddress />
                    <BillingPaddleBusiness />
                  </BillingInfoWrapper>
                </div>
              )}
            </ContentInner>
          </Content>
        )}
        <Content>
          <TitleWrapper>
            <ContentTitle>{t('billingInvoiceTitle')}</ContentTitle>
          </TitleWrapper>
          <ContentInner>
            <BillingHistoryList organizationId={license.organizationId as OrganizationId} />
          </ContentInner>
        </Content>
      </Box>
    </>
  );
};

BillingPage.getLayout = (page) => {
  return (
    <ConsoleBasicLayout user={page.props.me} license={page.props.license}>
      {page}
      <Footer />
      <LiveChat />
    </ConsoleBasicLayout>
  );
};

export const getServerSideProps: GetServerSideProps<BillingPageProps> = async (context) => {
  try {
    const result = await checkUserVerifiedInServerSide(context);

    if (result.redirect) {
      return result;
    }

    const license = await getLicenseInServerSide(context);

    return {
      props: {
        me: result.props.user,
        license,
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

const BillingInfoWrapper = styled.div`
  display: flex;
  margin-top: 0.5rem;
  gap: 2rem;
`;
