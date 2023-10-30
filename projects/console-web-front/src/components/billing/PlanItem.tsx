import { Button, Divider, Select } from 'antd';
import styled from 'styled-components';

interface Props {
  // title: React.ReactNode;
  // price: React.ReactNode;
  // currency: string;
  onClickUpgrade: () => void;
}

const PlanItem: React.FC<Props> = ({ onClickUpgrade }) => {
  return (
    <Box>
      <div>
        <div>
          <PricingTitle>Title</PricingTitle>
        </div>
        <div style={{ marginBottom: '.5rem' }}>
          <PricingPrice>price / month</PricingPrice>
        </div>
        <div style={{ marginBottom: '.5rem' }}>
          <Select
            style={{ width: '100%' }}
            options={[
              {
                label: '1',
                value: '1',
              },
              {
                label: '2',
                value: '2',
              },
            ]}
            defaultValue="1"
          />
        </div>
        <div>
          {/* change, upgrade or go annual */}
          <Button type="primary" style={{ width: '100%' }} onClick={onClickUpgrade}>
            Upgrade
          </Button>
        </div>
        <Divider />
        <div>
          <ul>
            <li>feature1</li>
            <li>feature2</li>
            <li>feature3</li>
            <li>feature4</li>
            <li>feature5</li>
          </ul>
        </div>
      </div>
    </Box>
  );
};

export default PlanItem;

const Box = styled.div`
  width: 250px;
  height: 500px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.75rem;
  line-height: 1.5;
`;

const PricingTitle = styled.b`
  font-size: 1.2rem;
  font-weight: 700;
`;

const PricingPrice = styled.span`
  font-size: 1.5rem;
`;
