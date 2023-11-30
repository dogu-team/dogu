import { EditOutlined } from '@ant-design/icons';
import { BillingPlanInfoBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import { getUpdatePaymentMethodTransaction } from '../../api/billing';
import usePaddle from '../../hooks/usePaddle';
import useLicenseStore from '../../stores/license';
import { flexRowSpaceBetweenStyle } from '../../styles/box';
import { sendErrorNotification } from '../../utils/antd';

interface Props {
  plan: BillingPlanInfoBase;
}

const BillingPaymentMethodPaddle: React.FC<Props> = ({ plan }) => {
  const license = useLicenseStore((state) => state.license);
  const { t } = useTranslation();
  const { paddleRef, loading } = usePaddle();

  const handleClickEdit = async () => {
    if (!license) {
      return;
    }

    try {
      const rv = await getUpdatePaymentMethodTransaction(plan.billingPlanInfoId);
      if (rv.status === 200 && rv.body) {
        paddleRef.current?.Checkout.open({
          settings: {
            successUrl: `${window.location.origin}/billing`,
          },
          transactionId: rv.body.paddle.transactionId,
          customer: {
            id: rv.body.paddle.customerId,
          },
          customData: {
            organizationId: license.organizationId,
            billingPlanInfoId: plan.billingPlanInfoId,
          },
        });
      } else {
        throw new Error('Failed to get transaction');
      }
    } catch (e) {
      sendErrorNotification(`Failed to get transaction`);
    }
  };

  if (plan.paddleMethodType === 'card') {
    return (
      <div>
        <CardDetail>
          <span>{t('billing:cardNumberLabel')}</span>
          <p>
            <label style={{ verticalAlign: 'sub' }}>**** **** ****</label> {plan.cardNumberLast4Digits}{' '}
            <b style={{ textTransform: 'capitalize' }}>{`(${plan.cardCode})`}</b>
          </p>
        </CardDetail>
        <CardDetail>
          <span>{t('billing:cardExpiryLabel')}</span>
          <p>
            {plan.cardExpirationMonth?.length === 1 ? `0${plan.cardExpirationMonth}` : plan.cardExpirationMonth} /{' '}
            {plan.cardExpirationYear?.slice(2)}
          </p>
        </CardDetail>

        <div style={{ marginTop: '1rem' }}>
          <EditButton onClick={handleClickEdit} disabled={loading}>
            <EditOutlined />
            &nbsp;Edit payment method
          </EditButton>
        </div>
      </div>
    );
  }

  return null;
};

export default BillingPaymentMethodPaddle;

const CardDetail = styled.div`
  margin-bottom: 0.25rem;

  span {
    font-size: 0.85rem;
    color: ${(props) => props.theme.main.colors.gray3};
  }

  p {
    margin-top: 0.25rem;
    font-weight: 500;
  }
`;

const EditButton = styled.button`
  padding: 0.25rem;
  background-color: transparent;
  color: ${(props) => props.theme.colorPrimary};
  text-decoration: underline;
  font-size: 0.8rem;
`;
