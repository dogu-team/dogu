import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

import H2 from 'src/components/common/headings/H2';
import H3 from 'src/components/common/headings/H3';
import Footer from './Footer';
import resources from '../../resources';
import { flexRowBaseStyle } from '../../styles/box';
import DoguText from '../common/DoguText';
import { getLocaledLink } from '../../utils/locale';

interface Props {
  titleI18nKey?: string;
  children: React.ReactElement;
}

const SmallBoxCenteredLayout = (props: Props) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Box>
      <Inner>
        <NameWrapper>
          <H2>
            <StyledLink href={`https://dogutech.io${getLocaledLink(router.locale, '')}`}>
              <Image src={resources.icons.logo} width={48} height={48} alt="Dogu" style={{ marginRight: '.5rem' }} />
              <DoguText />
            </StyledLink>
          </H2>
        </NameWrapper>
        <ContentBox>
          {props.titleI18nKey && (
            <div>
              <H3>{t(props.titleI18nKey)}</H3>
            </div>
          )}
          {props.children}
        </ContentBox>
      </Inner>
      <Footer />
    </Box>
  );
};

export default SmallBoxCenteredLayout;

const Box = styled.div`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
`;

const Inner = styled.div`
  display: flex;
  margin: 2rem 0;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media only screen and (max-width: 767px) {
    padding: 0 1rem;
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #000;
  text-decoration: none;
`;

const FlexRowBox = styled.div`
  ${flexRowBaseStyle}
`;

const ContentBox = styled.div`
  width: 400px;
  padding: 24px;
  border: 1px solid #ccc;
  border-radius: 12px;

  @media only screen and (max-width: 767px) {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const NameWrapper = styled.div`
  width: 400px;
  margin-bottom: 24px;

  @media only screen and (max-width: 767px) {
    width: 100%;
    max-width: 400px;
    margin: 0 auto 24px;
  }
`;
