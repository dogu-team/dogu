import { Form, Radio, Space } from 'antd';
import { useEffect } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import BillingCalculatedPreview from './BillingCalculatedPreview';
import BillingMethodRegistrationForm, { BillingMethodRegistrationFormValues } from './BillingMethodRegistrationForm';
import BillingDurationSwitch from './BillingDurationSwitch';
import { CallBillingApiResponse, FindBillingMethodResponse } from '@dogu-private/console';
import { swrAuthFetcher } from '../../api';

interface Props {}

const BillingPayStep: React.FC<Props> = () => {
  const license = useBillingPlanPurchaseStore((state) => state.license);
  const { data, isLoading } = useSWR<CallBillingApiResponse<FindBillingMethodResponse>>(
    license?.organizationId && `/billing/methods?organizationId=${license.organizationId}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );
  const [form] = Form.useForm<BillingMethodRegistrationFormValues>();
  const updateCardForm = useBillingPlanPurchaseStore((state) => state.updateCardForm);

  useEffect(() => {
    updateCardForm(form);

    return () => {
      updateCardForm(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    <div>Loading...</div>;
  }

  const hasPayment = data?.body?.ok && data.body.methods.length > 0;

  return (
    <div>
      <FlexEnd>
        <BillingDurationSwitch />
      </FlexEnd>
      <FlexBox>
        <PaymentContent>
          {hasPayment ? (
            <Radio.Group>
              <Space direction="vertical">
                <Radio>
                  <div></div>
                </Radio>
                <Radio>New card</Radio>
              </Space>
            </Radio.Group>
          ) : (
            <BillingMethodRegistrationForm form={form} />
          )}
        </PaymentContent>
        <BillingCalculatedPreview />
      </FlexBox>
    </div>
  );
};

export default BillingPayStep;

const FlexBox = styled.div`
  display: flex;
  gap: 1rem;
`;

const FlexEnd = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const PaymentContent = styled.div`
  flex: 1;
`;
