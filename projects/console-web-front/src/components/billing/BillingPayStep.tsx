import { Form } from 'antd';
import styled from 'styled-components';

import BillingCalculatedPreview from './BillingCalculatedPreview';
import BillingRegistrationForm, { BillingRegistrationFormValues } from './BillingCardRegistrationForm';
import BillingDurationSwitch from './BillingDurationSwitch';

interface Props {}

const BillingPayStep: React.FC<Props> = () => {
  const [form] = Form.useForm<BillingRegistrationFormValues>();

  const handlePay = async () => {};

  return (
    <div>
      <FlexEnd>
        <BillingDurationSwitch />
      </FlexEnd>
      <FlexBox>
        <BillingRegistrationForm form={form} />
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
