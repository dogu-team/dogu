import { CSSProperties } from 'react';
import styled from 'styled-components';
import { Button, ButtonProps } from 'antd';

const StyledButton = styled(Button)`
  width: 100%;
`;

interface Props extends ButtonProps {}

const SubmitButton = (props: Props) => {
  return (
    <StyledButton htmlType="submit" type="primary" {...props}>
      {props.children}
    </StyledButton>
  );
};

export default SubmitButton;
