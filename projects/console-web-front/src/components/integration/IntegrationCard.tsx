import { Button } from 'antd';
import styled from 'styled-components';

interface Props {
  icon: React.ReactNode;
  name: string;
  description: React.ReactNode;
  connectButton: React.ReactNode;
}

function IntegrationButton({ icon, name, description, connectButton }: Props) {
  return (
    <Container>
      <IconContainer>{icon}</IconContainer>
      <TextContainer>
        <p style={{ fontSize: '1rem', fontWeight: '600' }}>{name}</p>
        <div style={{ marginTop: '6px' }} />
        <p style={{ fontSize: '.8rem' }}>{description}</p>
      </TextContainer>

      {connectButton}
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
  flex-shrink: 0;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 75%;
  margin-right: 0.5rem;
`;

export default IntegrationButton;
