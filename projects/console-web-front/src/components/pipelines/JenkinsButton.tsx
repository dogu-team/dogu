import { RoutineBase } from '@dogu-private/console';
import { Button } from 'antd';
import Image from 'next/image';
import styled from 'styled-components';
import { BiLinkExternal } from 'react-icons/bi';

interface Props {
  routine?: RoutineBase;
}

const JenkinsButton = ({ routine }: Props) => {
  if (routine) {
    return null;
  }

  return (
    <StyledButton
      href={'https://docs.dogutech.io/integration/cicd/jenkins'}
      target="_blank"
      type="link"
      icon={<Image src="/resources/icons/jenkins-logo.svg" alt="Jenkins" width={16} height={16} />}
    >
      <p style={{ marginLeft: '8px' }}>Jenkins</p>&nbsp;
      <BiLinkExternal />
    </StyledButton>
  );
};

export default JenkinsButton;

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
