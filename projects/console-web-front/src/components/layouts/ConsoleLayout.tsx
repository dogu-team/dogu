import { OrganizationBase } from '@dogu-private/console';
import { Layout } from 'antd';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';
import { isAxiosError } from 'axios';

import H4 from 'src/components/common/headings/H4';
import ConsoleBasicLayout from './ConsoleBasicLayout';
import LiveChat from '../external/livechat';
import { swrAuthFetcher } from '../../api';
import ErrorBox from '../common/boxes/ErrorBox';
import { OrganizationContext } from '../../hooks/context/useOrganizationContext';
import { getErrorMessageFromAxios } from '../../utils/error';
import { OrganizationServerSideProps } from '../../ssr/organization';

export interface ConsoleLayoutProps extends OrganizationServerSideProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  titleI18nKey?: string;
  title?: React.ReactNode;
  padding?: string;
}

const ConsoleLayout = ({
  titleI18nKey,
  children,
  sidebar,
  title,
  padding,
  organization,
  user,
  license,
}: ConsoleLayoutProps) => {
  const { t } = useTranslation();
  const { data, error, mutate, isLoading } = useSWR<OrganizationBase>(
    `/organizations/${organization.organizationId}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
      fallbackData: organization,
    },
  );

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <ErrorBox
        title="Something went wrong"
        desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot get organization information'}
      />
    );
  }

  return (
    <OrganizationContext.Provider value={{ organization: data ?? organization, mutate }}>
      <ConsoleBasicLayout license={license} user={user}>
        <StyledLayout>
          {sidebar}
          <StyledLayoutContent>
            <PaddingBox style={{ padding }}>
              {(title ?? titleI18nKey) && (
                <TitleBox>
                  {title ?? <StyledH4>{titleI18nKey ? t(titleI18nKey) : ''}</StyledH4>}
                  <StyledHr />
                </TitleBox>
              )}
              <ContentBox>{children}</ContentBox>
            </PaddingBox>
          </StyledLayoutContent>
        </StyledLayout>
        <LiveChat />
      </ConsoleBasicLayout>
    </OrganizationContext.Provider>
  );
};

export default ConsoleLayout;

const StyledH4 = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
`;

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
  height: 100%;
`;

const StyledLayoutContent = styled(Layout.Content)`
  background-color: #ffffff;
  height: 100%;
`;

const TitleBox = styled.div`
  display: flex;
  min-height: 2.75rem;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
  flex-shrink: 0;
`;

const PaddingBox = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 2rem;
  padding-bottom: 6rem;
  height: 100%;
  overflow-y: auto;

  @media only screen and (max-width: 767px) {
    padding: 0;
  }
`;

const ContentBox = styled.div`
  margin-top: 1rem;
  flex: 1;
`;
