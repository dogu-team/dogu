import { CreditCardOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Radio, RadioChangeEvent, Space } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useEffect } from 'react';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import useLicenseStore from '../../stores/license';
import BillingMethodRegistrationForm, { BillingMethodRegistrationFormValues } from './BillingMethodRegistrationForm';

interface Props {}

const BillingPaymentPreview: React.FC<Props> = () => {
  const license = useLicenseStore((state) => state.license);
  const [form] = Form.useForm<BillingMethodRegistrationFormValues>();
  const updateCardForm = useBillingPlanPurchaseStore((state) => state.updateCardForm);
  const [withNewCard, updateWithNewCard] = useBillingPlanPurchaseStore(
    (state) => [state.withNewCard, state.updateWithNewCard],
    shallow,
  );
  const { t } = useTranslation('billing');

  useEffect(() => {
    updateCardForm(form);

    return () => {
      updateCardForm(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeRadio = (e: RadioChangeEvent) => {
    form.resetFields();
    updateWithNewCard(e.target.value);
  };

  const currentPayment = license?.billingOrganization?.billingMethodNice;

  return (
    <PaymentContent>
      {!!currentPayment ? (
        <div>
          <Radio.Group style={{ width: '100%' }} value={withNewCard} onChange={handleChangeRadio}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <StyledRadio style={{ width: '100%' }} value={false}>
                <RadioContent isSelected={withNewCard === false}>
                  <p>
                    <CreditCardOutlined style={{ marginRight: '.4rem' }} />
                    <label style={{ verticalAlign: 'sub' }}>**** **** ****</label>{' '}
                    {license.billingOrganization.billingMethodNice?.cardNumberLast4Digits}{' '}
                    {`(${license.billingOrganization.billingMethodNice?.cardName})`}
                  </p>

                  <span>{`(${t('paymentPreviewDefaultCardLabelText')})`}</span>
                </RadioContent>
              </StyledRadio>
              <StyledRadio style={{ width: '100%' }} value={true}>
                <RadioContent isSelected={withNewCard}>
                  <p>
                    <EditOutlined style={{ marginRight: '.4rem' }} />
                    {t('paymentPreviewChangeCardButtonText')}
                  </p>
                </RadioContent>
              </StyledRadio>
            </Space>
          </Radio.Group>

          {withNewCard && (
            <div style={{ marginTop: '1rem' }}>
              <BillingMethodRegistrationForm form={form} />
            </div>
          )}
        </div>
      ) : (
        <BillingMethodRegistrationForm form={form} />
      )}
    </PaymentContent>
  );
};

export default BillingPaymentPreview;

const PaymentContent = styled.div`
  flex: 1;
  flex-shrink: 0;
`;

const StyledRadio = styled(Radio)`
  & > span:last-child {
    width: 100%;
  }
`;

const RadioContent = styled.div<{ isSelected: boolean }>`
  width: 100%;
  display: flex;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${(props) => (props.isSelected ? props.theme.colorPrimary : '#d9d9d9')};
  font-size: 0.85rem;
  align-items: center;
  justify-content: space-between;

  span {
    font-size: 0.75rem;
    color: #999;
  }
`;
