import styled from 'styled-components';
import SlackIcon from 'public/resources/icons/slack.svg';
import ConnectButton from './ConnectButton';

interface Props {
  icon: JSX.Element;
  name: string;
  description: string;
  href: string;
}

function IntegrationButton(props: Props) {
  return (
    <Container>
      <IconContainer>{props.icon}</IconContainer>
      <TextContainer>
        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{props.name}</p>
        <div style={{ marginTop: '6px' }} />
        <p style={{ fontSize: '12px' }}>{props.description}</p>
      </TextContainer>
      <ConnectButton href={props.href} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 8px;
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background-color: #f5f5f5;
  margin-right: 16px;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 75%;
`;

export default IntegrationButton;
