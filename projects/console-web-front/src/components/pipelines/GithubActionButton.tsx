import { RoutineBase } from '@dogu-private/console';
import { Button } from 'antd';
import Image from 'next/image';
import { BiLinkExternal } from 'react-icons/bi';
import styled from 'styled-components';

interface Props {
  routine?: RoutineBase;
}

const GithubActionButton = ({ routine }: Props) => {
  if (routine) {
    return null;
  }

  return (
    <StyledButton
      href={'https://docs.dogutech.io/integration/cicd/github'}
      target="_blank"
      type="link"
      icon={<Image src="/resources/icons/github-action-logo.svg" alt="Github Action" width={16} height={16} />}
    >
      <p style={{ marginLeft: '8px' }}>Github Action</p>&nbsp;
      <BiLinkExternal />
    </StyledButton>
  );
};

export default GithubActionButton;

const StyledButton = styled(Button)`
  color: ${(props) => props.theme.colorPrimary};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  padding: 4px 8px;

  &:active {
    color: ${(props) => props.theme.colorPrimary} !important;
  }
`;
