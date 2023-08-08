import styled from 'styled-components';

const StepThumbnailBar = () => {
  return (
    <div>
      <TitleWrapper>
        <Title>Steps</Title>
      </TitleWrapper>
      <div></div>
    </div>
  );
};

export default StepThumbnailBar;

const TitleWrapper = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.p`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.gray5};
`;
