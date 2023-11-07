import { BillingSubscriptionPlanInfoResponse } from '@dogu-private/console';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { shallow } from 'zustand/shallow';

import { purchasePlanWithExistingCard, purchasePlanWithNewCard } from '../../api/billing';
import useRequest from '../../hooks/useRequest';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import useEventStore from '../../stores/events';
import useLicenseStore from '../../stores/license';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { parseNicePaymentMethodFormValues } from '../../utils/billing';

const BillingPurchaseButton: React.FC = () => {
  const selectedPlan = useBillingPlanPurchaseStore((state) => state.selectedPlan);
  const cardForm = useBillingPlanPurchaseStore((state) => state.cardForm);
  const withNewCard = useBillingPlanPurchaseStore((state) => state.withNewCard);
  const [purchaseWithNewCardLoading, requestPurchaseWithNewCard] = useRequest(purchasePlanWithNewCard);
  const [purchaseWithExistingCardLoading, requestPurchaseWithExistingCard] = useRequest(purchasePlanWithExistingCard);
  const isAnnual = useBillingPlanPurchaseStore((state) => state.isAnnual);
  const couponCode = useBillingPlanPurchaseStore((state) => state.coupon);
  const [license, updateLicense] = useLicenseStore((state) => [state.license, state.updateLicense], shallow);
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation('billing');

  const handleSuccess = (plan: BillingSubscriptionPlanInfoResponse | null) => {
    sendSuccessNotification('Successfully purchased plan!');
    fireEvent('onPurchaseCompleted');

    if (plan && license) {
      updateLicense({
        ...license,
        billingOrganization: {
          ...license.billingOrganization,
          billingSubscriptionPlanInfos: [
            ...license.billingOrganization.billingSubscriptionPlanInfos.filter((p) => p.type !== plan.type),
            plan,
          ],
        },
      });
    }
  };

  const handlePurchase = async () => {
    if (!cardForm || !license?.organizationId || !selectedPlan) {
      return;
    }

    const values = await cardForm.validateFields();
    try {
      if (!withNewCard && Object.values(values).every((v) => !v)) {
        const rv = await requestPurchaseWithExistingCard({
          organizationId: license.organizationId,
          category: selectedPlan?.category,
          type: selectedPlan?.planType,
          option: selectedPlan?.option,
          currency: 'KRW',
          period: isAnnual ? 'yearly' : 'monthly',
          couponCode: couponCode ?? undefined,
        });

        if (rv.errorMessage || !rv.body?.ok) {
          sendErrorNotification('Failed to purchase plan! Please contact us.');
          return;
        }

        handleSuccess(rv.body.plan);
      } else {
        const rv = await requestPurchaseWithNewCard({
          organizationId: license.organizationId,
          category: selectedPlan?.category,
          type: selectedPlan?.planType,
          option: selectedPlan?.option,
          currency: 'KRW',
          period: isAnnual ? 'yearly' : 'monthly',
          couponCode: couponCode ?? undefined,
          registerCard: parseNicePaymentMethodFormValues(values),
        });

        if (rv.errorMessage || !rv.body?.ok) {
          sendErrorNotification('Failed to purchase plan! Please contact us.');
          return;
        }

        handleSuccess(rv.body.plan);
      }
    } catch (e) {
      sendErrorNotification('Failed to purchase plan! Please contact us.');
    }
  };

  return (
    <Button
      type="primary"
      onClick={handlePurchase}
      style={{ width: '100%' }}
      loading={purchaseWithNewCardLoading || purchaseWithExistingCardLoading}
    >
      {t('purchaseButtonText')}
    </Button>
  );
};

export default BillingPurchaseButton;
