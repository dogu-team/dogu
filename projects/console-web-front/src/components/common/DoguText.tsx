import styled from 'styled-components';
import { Chakra_Petch } from 'next/font/google';

const chakraPetch = Chakra_Petch({ subsets: ['latin'], weight: ['700'] });

const DoguText = (props: React.HTMLAttributes<HTMLElement>) => {
  return (
    <StyledTextLogo {...props} className={chakraPetch.className}>
      Dogu
    </StyledTextLogo>
  );
};

export default DoguText;

const StyledTextLogo = styled.b`
  line-height: 1.4;
  font-weight: 700;
`;
