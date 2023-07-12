import styled from 'styled-components';

interface Props {
  id: string;
  title: string;
  description?: React.ReactNode;
  content: React.ReactNode;
}

const GuideStep = ({ id, title, description, content }: Props) => {
  return (
    <Step id={id}>
      <TextWrapper>
        <StepTitle>{title}</StepTitle>
        {description}
      </TextWrapper>
      <div>{content}</div>
    </Step>
  );
};

export default GuideStep;

const Step = styled.div`
  margin-bottom: 2rem;
`;

const StepTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
`;

const TextWrapper = styled.div`
  margin-bottom: 0.5rem;
`;
