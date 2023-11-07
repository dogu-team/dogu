import { Radio } from 'antd';
import styled from 'styled-components';

import BillingCalculatedPreview from './BillingCalculatedPreview';
import BillingDurationSwitch from './BillingDurationSwitch';
import BillingPaymentPreview from './BillingPaymentPreview';

interface Props {}

const BillingPayStep: React.FC<Props> = () => {
  return (
    <div>
      <FlexEnd>
        <BillingDurationSwitch />
      </FlexEnd>
      <FlexBox>
        <BillingPaymentPreview />
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
  flex-shrink: 0;
`;

const StyledRadio = styled(Radio)`
  & > span:last-child {
    width: 100%;
  }
`;

const RadioContent = styled.div`
  width: 100%;
  display: flex;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d9d9d9;
`;
