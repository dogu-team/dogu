import styled from 'styled-components';

import H2 from 'src/components/common/headings/H2';

interface Props {
  title: string;
  description: string;
  visualizeContent: React.ReactNode;
  reversed?: boolean;
}

const ProductSection = ({ title, description, visualizeContent, reversed = false }: Props) => {
  return (
    <ProductBox reversed={reversed}>
      <ProductContentContainer>{visualizeContent}</ProductContentContainer>
      <ProductContainer>
        <H2>{title}</H2>
        <Border />
        <StyledP>{description}</StyledP>
      </ProductContainer>
    </ProductBox>
  );
};

const ProductBox = styled.div<{ reversed?: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.reversed ? 'row-reverse' : 'row')};
  justify-content: space-between;
  padding: 36px ${(props) => props.theme.spaces.landing};
  height: 500px;
  align-items: center;

  @media only screen and (max-width: 1023px) {
    padding: 2rem;
  }
  @media only screen and (max-width: 767px) {
    height: auto;
    flex-direction: ${(props) => (props.reversed ? 'column' : 'column-reverse')};
    padding: 2rem 1rem;
  }
`;

const ProductContainer = styled.div`
  width: 45%;
  align-content: center;

  @media only screen and (max-width: 1023px) {
    width: 48%;
  }
  @media only screen and (max-width: 767px) {
    width: 100%;
    margin-bottom: 1rem;
  }
`;

const ProductContentContainer = styled.div`
  width: 45%;
  height: 100%;

  @media only screen and (max-width: 1023px) {
    width: 48%;
  }
  @media only screen and (max-width: 767px) {
    width: 100%;
    height: auto;
  }
`;

const Border = styled.div`
  margin-bottom: 24px;
`;

const StyledP = styled.p`
  font-size: 18px;
  line-height: 1.4;
`;

export default ProductSection;
