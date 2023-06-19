import { Layout } from 'antd';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import H4 from 'src/components/common/headings/H4';
import useAuth from 'src/hooks/useAuth';
import ConsoleBasicLayout from './ConsoleBasicLayout';

interface Props {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  isWebview: boolean;
  titleI18nKey?: string;
  title?: string;
}

const ConsoleLayout = ({ titleI18nKey, children, sidebar, title, isWebview }: Props) => {
  const { me, isLoading, error } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  if (isLoading) {
    return null;
  }

  if (!me || error) {
    if (!me) {
      router.push(`/signin?redirect=${router.asPath}`);
      return null;
    }

    router.push(`/account/organizations`);
    return null;
  }

  return (
    <ConsoleBasicLayout>
      <StyledLayout>
        {sidebar}
        <StyledLayoutContent>
          <PaddingBox>
            {(title ?? titleI18nKey) && (
              <TitleBox>
                <H4>{title ?? (titleI18nKey ? t(titleI18nKey) : '')}</H4>
                <StyledHr />
              </TitleBox>
            )}
            <ContentBox>{children}</ContentBox>
          </PaddingBox>
        </StyledLayoutContent>
      </StyledLayout>
    </ConsoleBasicLayout>
  );
};

const StyledHr = styled.hr`
  display: block;
  height: 2px;
  background-color: ${(props) => props.theme.colors.gray2};
  border: none;
`;

const StyledLayout = styled(Layout)`
  display: flex;
  flex-direction: row;
  background-color: #fff;
  flex: 1;
`;

const StyledLayoutContent = styled(Layout.Content)`
  background-color: #ffffff;
`;

const TitleBox = styled.div`
  display: flex;
  height: 3rem;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
`;

const PaddingBox = styled.div`
  padding: 2rem;

  @media only screen and (max-width: 767px) {
    padding: 0;
  }
`;

const ContentBox = styled.div`
  margin-top: 1rem;
`;

export default ConsoleLayout;
