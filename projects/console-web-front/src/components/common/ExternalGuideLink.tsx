import { Button, ButtonProps } from 'antd';
import styled from 'styled-components';
import { BiLinkExternal } from 'react-icons/bi';

interface Props extends Omit<ButtonProps, 'type' | 'target'> {}

const ExternalGuideLink = ({ children, ...props }: Props) => {
  return (
    <StyledButton target="_blank" {...props}>
      <p style={{ marginLeft: '.5rem' }}>{children}</p>
      &nbsp;
      <BiLinkExternal />
    </StyledButton>
  );
};

export default ExternalGuideLink;

const StyledButton = styled(Button)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  padding: 4px 8px;
  cursor: pointer;

  &:active {
    color: ${(props) => props.theme.colorPrimary} !important;
  }
`;
