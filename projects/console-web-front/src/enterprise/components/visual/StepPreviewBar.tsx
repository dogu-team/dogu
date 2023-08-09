import styled from 'styled-components';

import StepPreview from './StepPreview';

const StepPreviewBar = () => {
  return (
    <div>
      <TitleWrapper>
        <Title>Steps</Title>
      </TitleWrapper>
      <div>
        <StepPreview />
        <StepPreview />
        <StepPreview />
      </div>
    </div>
  );
};

export default StepPreviewBar;

const TitleWrapper = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.p`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.gray5};
`;
