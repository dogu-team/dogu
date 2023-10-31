import styled from 'styled-components';
import { GithubOutlined, GlobalOutlined, LinkedinFilled, TwitterOutlined, UpOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { Dropdown, MenuProps } from 'antd';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Cookies from 'universal-cookie';

import { CommonUIProps } from 'src/types/common';
import { koreanP3Style, maxWidthInnerStyle } from '../../styles/main';
import { flexRowSpaceBetweenStyle } from '../../styles/box';

interface Props extends CommonUIProps {
  showCompanyInfo?: boolean;
}

const Footer = ({ showCompanyInfo = false, className }: Props) => {
  const router = useRouter();
  const { lang, t } = useTranslation();

  const items: MenuProps['items'] = [
    {
      label: (
        <Link href={router.asPath} locale="ko">
          한국어
        </Link>
      ),
      key: '0',
      onClick: () => {
        const cookie = new Cookies();
        cookie.set('NEXT_LOCALE', 'ko', { path: '/' });
      },
    },
    {
      label: (
        <Link href={router.asPath} locale="en">
          English
        </Link>
      ),
      key: '1',
      onClick: () => {
        const cookie = new Cookies();
        cookie.set('NEXT_LOCALE', 'en', { path: '/' });
      },
    },
  ];

  return (
    <Box className={className}>
      <Inner>
        <FlexBox>
          <LinkBox>
            {/* {process.env.NEXT_PUBLIC_ENV !== 'production' && (
            <StyledLink href="/" target="_blank">
              {t('common:footerTermsOfUse')}
            </StyledLink>
          )} */}
            <StyledLink href={`${process.env.NEXT_PUBLIC_LANDING_URL}/notices/privacy`} target="_blank">
              {t('common:footerPrivacyPolicy')}
            </StyledLink>
          </LinkBox>
        </FlexBox>
        <BottomBox>
          <LanguageWrapper>
            <Dropdown menu={{ items }} trigger={['click']}>
              <LanguageMenu onClick={(e) => e.preventDefault()}>
                <GlobalOutlined />
                &nbsp;{lang === 'ko' ? '한국어' : 'English'}&nbsp;
                <UpOutlined />
              </LanguageMenu>
            </Dropdown>
          </LanguageWrapper>
          <StyledLink href="https://github.com/dogu-team" target="_blank">
            <GithubOutlined style={{ fontSize: '2rem', cursor: 'pointer' }} />
          </StyledLink>
          <StyledLink href="https://www.linkedin.com/company/dogu-technologies" target="_blank">
            <LinkedinFilled style={{ fontSize: '2rem', cursor: 'pointer' }} />
          </StyledLink>
          <StyledLink href="https://twitter.com/dogutechio" target="_blank" style={{ marginRight: '0' }}>
            <TwitterOutlined style={{ fontSize: '2rem', cursor: 'pointer' }} />
          </StyledLink>
        </BottomBox>
      </Inner>
      {showCompanyInfo && (
        <Inner style={{ marginTop: '1rem' }}>
          <CompanyInfo>
            <b>{t('common:footerCompanyName')}</b>
            <p>
              {t('common:footerRepresentative')} | {t('common:footerCompanyRegistrationNumber')}
              <br />
              Email:&nbsp;
              <Link href="mailto:contact@dogutech.io" style={{ color: '#ffffff', textDecoration: 'underline' }}>
                contact@dogutech.io
              </Link>
              <br />
              {t('common:footerCompanyAddress')}
            </p>

            <p style={{ marginTop: '1.5rem' }}>
              ©{new Date().getFullYear()} Dogu Technologies Inc. All rights reserved.
            </p>
          </CompanyInfo>
        </Inner>
      )}
    </Box>
  );
};

const Box = styled.div`
  width: 100%;
  padding: 2rem 0;
  background-color: ${(props) => props.theme.main.colors.blue2};
  flex-shrink: 0;
  color: ${(props) => props.theme.main.colors.white};

  @media only screen and (max-width: 1023px) {
    padding: 20px 0;
  }
  @media only screen and (max-width: 767px) {
    display: block;
    padding: 1.5rem 0;
  }
`;

const Inner = styled.div`
  ${maxWidthInnerStyle}
  ${flexRowSpaceBetweenStyle}

  @media only screen and (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FlexBox = styled.div`
  display: flex;
  align-items: center;

  @media only screen and (max-width: 767px) {
    margin-bottom: 1rem;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Text = styled.p`
  ${koreanP3Style}
  color: ${(props) => props.theme.main.colors.white};
`;

const LinkBox = styled.div`
  @media only screen and (max-width: 767px) {
    margin-top: 1.5rem;
  }
`;

const StyledLink = styled(Link)`
  margin-right: 1rem;
  font-size: 0.8rem;
  font-weight: 400;
  text-decoration: none;

  color: ${(props) => props.theme.main.colors.white};
  &:hover {
    color: ${(props) => props.theme.main.colors.white};
  }
`;

const LanguageWrapper = styled.div`
  margin-right: 1rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.gray4};
`;

const LanguageMenu = styled.button`
  padding: 0.5rem;
  background-color: #fff;
  color: ${(props) => props.theme.colors.black};
  font-size: 0.9rem;

  &:hover {
    color: #000000;
  }
`;

const BottomBox = styled.div`
  display: flex;
  align-items: center;

  @media only screen and (max-width: 767px) {
    margin-top: 1rem;
    justify-content: center;
  }
`;

const CompanyInfo = styled.div`
  font-size: 0.75rem;
  line-height: 1.4;
  font-weight: 300;

  b {
    font-weight: 700;
  }
`;

export default Footer;
