import { Layout } from 'antd';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import { OrganizationBase } from '@dogu-private/console';
import useSWR, { SWRConfig } from 'swr';

import H4 from 'src/components/common/headings/H4';
import ConsoleBasicLayout from './ConsoleBasicLayout';
import LiveChat from '../external/livechat';
import { swrAuthFetcher } from '../../api';
import ErrorBox from '../common/boxes/ErrorBox';

export interface ConsoleLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  organization: OrganizationBase;
  titleI18nKey?: string;
  title?: string;
  padding?: string;
}

const ConsoleLayout = ({ titleI18nKey, children, sidebar, title, padding, organization }: ConsoleLayoutProps) => {
  const { t } = useTranslation();
  const { data, error, mutate, isLoading } = useSWR<OrganizationBase>(`/organizations/${organization.organizationId}`, swrAuthFetcher, {
    revalidateOnFocus: false,
    fallbackData: organization,
  });

  if (isLoading) {
    return null;
  }

  if (error) {
    return <ErrorBox title="Oops..." desc="Failed to load console" />;
  }

  return (
    <SWRConfig>
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
    </SWRConfig>
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
  padding-bottom: 6rem;

  @media only screen and (max-width: 767px) {
    padding: 0;
  }
`;

const ContentBox = styled.div`
  margin-top: 1rem;
`;

export default ConsoleLayout;
