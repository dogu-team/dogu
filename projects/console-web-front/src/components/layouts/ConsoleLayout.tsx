import { Layout } from 'antd';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import H4 from 'src/components/common/headings/H4';
import ConsoleBasicLayout from './ConsoleBasicLayout';
import LiveChat from '../external/livechat';
import Script from 'next/script';
import Beamer from '../external/beamer';

export interface ConsoleLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  titleI18nKey?: string;
  title?: string;
  padding?: string;
}

const ConsoleLayout = ({ titleI18nKey, children, sidebar, title, padding }: ConsoleLayoutProps) => {
  const { t } = useTranslation();

  return (
    <ConsoleBasicLayout>
      <StyledLayout>
        {sidebar}
        <StyledLayoutContent>
          <PaddingBox style={{ padding }}>
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
      <LiveChat />
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
