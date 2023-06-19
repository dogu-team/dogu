import styled from 'styled-components';

const DoguText = (props: React.HTMLAttributes<HTMLElement>) => {
  return <StyledTextLogo {...props}>Dogu</StyledTextLogo>;
};

export default DoguText;

const StyledTextLogo = styled.b`
  font-family: 'Chakra Petch', 'Noto Sans KR', sans-serif;
  line-height: 1.4;
  font-weight: 500;
`;
