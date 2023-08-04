import { CheckOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import styled from 'styled-components';

interface Props extends ButtonProps {
  isConnected: boolean;
}

function IntegrationConnectButton({ isConnected, children, ...props }: Props) {
  return (
    <StyledButton type="ghost" {...props}>
      {children ?? isConnected ? <CheckOutlined style={{ color: 'green' }} /> : 'Connect'}
    </StyledButton>
  );
}

export default IntegrationConnectButton;

const StyledButton = styled(Button)`
  color: ${(props) => props.theme.colorPrimary};

  &:disabled {
    color: ${(props) => props.theme.colors.gray5};
    cursor: not-allowed;
  }
`;
