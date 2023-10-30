import { Button } from 'antd';
import styled from 'styled-components';

interface Props {}

const BillingCalculatedPreview: React.FC<Props> = ({}) => {
  const handleClickUpgrade = async () => {
    alert('TODO: payments');
  };

  return (
    <Box>
      <div>Preview</div>
      <Button type="primary" onClick={handleClickUpgrade} style={{ width: '100%' }}>
        Upgrade now
      </Button>
    </Box>
  );
};

export default BillingCalculatedPreview;

const Box = styled.div`
  width: 250px;
  background-color: ${(props) => props.theme.colorPrimary}22;
  border-radius: 0.5rem;
  padding: 0.75rem;
`;
