import styled from 'styled-components';
import Trans from 'next-translate/Trans';
import Link from 'next/link';

const ServiceAgreement = () => {
  return (
    <Box>
      <StyledText>
        <Trans i18nKey="registery:signUpServiceAgreement" components={[<StyledLink key="privacy" href="/service/privacy" target="_blank" />]} />
      </StyledText>
    </Box>
  );
};

export default ServiceAgreement;

const StyledText = styled.p`
  font-size: 0.8rem;
  font-weight: 300;
  color: ${(props) => props.theme.colors.gray5};
  line-height: 1.2;
`;

const Box = styled.div`
  display: flex;
  justify-content: center;
  font-size: 14px;
`;

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.colors.link};
`;
