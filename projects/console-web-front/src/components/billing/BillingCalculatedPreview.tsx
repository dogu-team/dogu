import { Button, Tag } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

interface Props {}

const BillingCalculatedPreview: React.FC<Props> = ({}) => {
  const [coupon, setCoupon] = useState<string | null>(null);
  const handleClickUpgrade = async () => {
    alert('TODO: payments');
  };

  return (
    <Box>
      <Content>
        <Tag color="success">New</Tag>
        <p>Live testing - blah blah</p>
      </Content>
      <Content>
        <CouponTextButton>Have a coupon?</CouponTextButton>
      </Content>
      <Button type="primary" onClick={handleClickUpgrade} style={{ width: '100%' }}>
        Purchase
      </Button>
    </Box>
  );
};

export default BillingCalculatedPreview;

const Box = styled.div`
  flex: 1;
  background-color: ${(props) => props.theme.colorPrimary}22;
  border-radius: 0.5rem;
  padding: 0.75rem;
  flex-shrink: 0;
`;

const Content = styled.div`
  margin-bottom: 1rem;
`;

const CouponTextButton = styled.button`
  padding: 0.2rem 0;
  background-color: transparent;
  text-decoration: underline;
  color: ${(props) => props.theme.main.colors.gray4};
  font-size: 0.8rem;
`;
