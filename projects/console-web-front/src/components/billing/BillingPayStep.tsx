import { Form } from 'antd';
import styled from 'styled-components';

import BillingCalculatedPreview from './BillingCalculatedPreview';
import BillingRegistrationForm, { BillingRegistrationFormValues } from './BillingCardRegistrationForm';

interface Props {}

const BillingPayStep: React.FC<Props> = () => {
  const [form] = Form.useForm<BillingRegistrationFormValues>();

  const handlePay = async () => {};

  return (
    <FlexBox>
      <BillingRegistrationForm form={form} />
      <BillingCalculatedPreview />
    </FlexBox>
  );
};

export default BillingPayStep;

const FlexBox = styled.div`
  display: flex;
  gap: 1rem;
`;
