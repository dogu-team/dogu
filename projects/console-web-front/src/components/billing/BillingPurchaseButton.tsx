import {
  BillingMethodNiceBase,
  BillingPlanInfoResponse,
  CloudLicenseBase,
  SelfHostedLicenseBase,
} from '@dogu-private/console';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { shallow } from 'zustand/shallow';

import { purchasePlanWithExistingCard, purchasePlanWithNewCard } from '../../api/billing';
import useRequest from '../../hooks/useRequest';
import { niceErrorCodeMessageI18nKeyMap } from '../../resources/plan';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import useEventStore from '../../stores/events';
import useLicenseStore from '../../stores/license';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { checkShouldPurchase, parseNicePaymentMethodFormValues } from '../../utils/billing';
import ErrorBox from '../common/boxes/ErrorBox';

const BillingPurchaseButton: React.FC = () => {
  const selectedPlan = useBillingPlanPurchaseStore((state) => state.selectedPlan);
  const cardForm = useBillingPlanPurchaseStore((state) => state.cardForm);
  const withNewCard = useBillingPlanPurchaseStore((state) => state.withNewCard);
  const [purchaseWithNewCardLoading, requestPurchaseWithNewCard] = useRequest(purchasePlanWithNewCard);
  const [purchaseWithExistingCardLoading, requestPurchaseWithExistingCard] = useRequest(purchasePlanWithExistingCard);
  const isAnnual = useBillingPlanPurchaseStore((state) => state.isAnnual);
  const couponCode = useBillingPlanPurchaseStore((state) => state.coupon);
  const [license, updateLicense] = useLicenseStore((state) => [state.license, state.updateLicense], shallow);
  const updatePurchaseErrorText = useBillingPlanPurchaseStore((state) => state.updatePurchaseErrorText);
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation('billing');

  if (!license) {
    return <ErrorBox title="Oops" desc={t('licenseNotFoundErrorMessage')} />;
  }

  if (!selectedPlan) {
    return <ErrorBox title="Oops" desc={t('planNotSelectedErrorMessage')} />;
  }

  const shouldPurchase = checkShouldPurchase(license, { ...selectedPlan, period: isAnnual ? 'yearly' : 'monthly' });

  const handleSuccess = (
    newLicense: CloudLicenseBase | SelfHostedLicenseBase | null,
    plan: BillingPlanInfoResponse | null,
    method: Partial<BillingMethodNiceBase> | null,
  ) => {
    sendSuccessNotification(shouldPurchase ? t('purchaseSuccessMessage') : t('changePlanSuccessMessage'));
    fireEvent('onPurchaseCompleted');

    if (license) {
      updateLicense({
        ...license,
        ...newLicense,
        billingOrganization: {
          ...license.billingOrganization,
          billingPlanInfos: plan
            ? [...license.billingOrganization.billingPlanInfos.filter((p) => p.type !== plan.type), plan]
            : license.billingOrganization.billingPlanInfos,
          billingMethodNice: Object.assign({}, license.billingOrganization.billingMethodNice, method ?? {}),
        },
      });
    }
  };

  const handlePurchase = async () => {
    if (!cardForm || !license?.organizationId || !selectedPlan) {
      return;
    }

    if (license.billingOrganization.billingMethod === 'paddle') {
      return;
    }

    const values = await cardForm.validateFields();
    updatePurchaseErrorText(null);
    try {
      if (!withNewCard && Object.values(values).every((v) => !v)) {
        const rv = await requestPurchaseWithExistingCard({
          organizationId: license.organizationId,
          billingPlanSourceId: selectedPlan.billingPlanSourceId,
          couponCode: couponCode ?? undefined,
        });

        if (rv.errorMessage || !rv.body?.ok) {
          if (!rv.body?.ok) {
            const niceCode = rv.body?.niceResultCode;
            updatePurchaseErrorText(
              niceCode && niceErrorCodeMessageI18nKeyMap[niceCode]
                ? t(`${niceErrorCodeMessageI18nKeyMap[niceCode]}`)
                : t('purchaseErrorMessage', { code: niceCode }),
            );
            return;
          }
          updatePurchaseErrorText(
            shouldPurchase ? t('purchaseErrorMessage', { code: rv.errorMessage }) : t('changePlanErrorMessage'),
          );
          return;
        }

        handleSuccess(rv.body.license, rv.body.plan, null);
      } else {
        const rv = await requestPurchaseWithNewCard({
          organizationId: license.organizationId,
          billingPlanSourceId: selectedPlan.billingPlanSourceId,
          couponCode: couponCode ?? undefined,
          registerCard: parseNicePaymentMethodFormValues(values),
        });

        if (rv.errorMessage || !rv.body?.ok) {
          if (!rv.body?.ok) {
            const niceCode = rv.body?.niceResultCode;
            updatePurchaseErrorText(
              niceCode && niceErrorCodeMessageI18nKeyMap[niceCode]
                ? t(`${niceErrorCodeMessageI18nKeyMap[niceCode]}`)
                : t('purchaseErrorMessage', { code: niceCode }),
            );
            return;
          }
          updatePurchaseErrorText(
            shouldPurchase ? t('purchaseErrorMessage', { code: rv.errorMessage }) : t('changePlanErrorMessage'),
          );
          return;
        }

        handleSuccess(rv.body.license, rv.body.plan, rv.body.method);
      }
    } catch (e) {
      updatePurchaseErrorText(
        shouldPurchase ? t('purchaseErrorMessage', { code: 'Unknown' }) : t('changePlanErrorMessage'),
      );
    }
  };

  return (
    <Button
      type="primary"
      onClick={handlePurchase}
      style={{ width: '100%' }}
      loading={purchaseWithNewCardLoading || purchaseWithExistingCardLoading}
    >
      {t(shouldPurchase ? 'purchaseButtonText' : 'changeButtonTitle')}
    </Button>
  );
};

export default BillingPurchaseButton;
