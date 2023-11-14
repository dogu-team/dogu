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
