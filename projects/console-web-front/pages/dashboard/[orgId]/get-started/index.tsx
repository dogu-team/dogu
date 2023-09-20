import { ClusterOutlined } from '@ant-design/icons';
import { OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { getOrganizationInServerSide } from '../../../../src/api/organization';
import DoguText from '../../../../src/components/common/DoguText';
import ConsoleBasicLayout from '../../../../src/components/layouts/ConsoleBasicLayout';
import CloudUserTutorial from '../../../../src/components/tutorial/CloudUserTutorial';
import DeviceFarmTutorial from '../../../../src/components/tutorial/DeviceFarmTutorial';
import SkipTutorialButton from '../../../../src/components/tutorial/SkipTutorialButton';
import { TutorialContext } from '../../../../src/hooks/context/useTutorialContext';
import { flexRowBaseStyle } from '../../../../src/styles/box';
import { checkUserVerifiedInServerSide } from '../../../../src/utils/auth';
import { NextPageWithLayout } from '../../../_app';

interface ServerSideProps {
  organization: OrganizationBase;
  me: UserBase;
}

const OrganizationTutorialPage: NextPageWithLayout<ServerSideProps> = ({ organization, me }) => {
  const [project, setProject] = useState<ProjectBase>();
  const { t } = useTranslation('tutorial');

  const isCloud = process.env.NEXT_PUBLIC_ENV === 'production';

  const updateProject = useCallback((project: ProjectBase) => {
    setProject(project);
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        organization,
        project: project ?? null,
        me,
        updateProject,
      }}
    >
      <Head>
        <title>Tutorial - {organization.name} | Dogu</title>
      </Head>
      <Box>
        <Inner>
          <HeaderContent>
            <div>
              <StyledTitle>
                {isCloud ? (
                  'Tutorial'
                ) : (
                  <Trans
                    i18nKey="tutorial:deviceFarmTutorialTitle"
                    components={{ icon: <ClusterOutlined style={{ margin: '0 0.35rem' }} /> }}
                  />
                )}
              </StyledTitle>
            </div>
            <div>
              <SkipTutorialButton>{t('skipTutorialLinkTitle')}</SkipTutorialButton>
            </div>
          </HeaderContent>
          {isCloud ? <CloudUserTutorial /> : <DeviceFarmTutorial />}
          <FlexEndBox>
            <SkipTutorialButton>{t('closeTutorialLinkTitle')}</SkipTutorialButton>
          </FlexEndBox>
        </Inner>
      </Box>
    </TutorialContext.Provider>
  );
};

OrganizationTutorialPage.getLayout = (page) => {
  return <ConsoleBasicLayout {...page.props}>{page}</ConsoleBasicLayout>;
};

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async (context) => {
  const [organization, checkResult] = await Promise.all([
    getOrganizationInServerSide(context),
    checkUserVerifiedInServerSide(context),
  ]);

  if (checkResult.redirect) {
    return checkResult;
  }

  return {
    props: {
      organization,
      me: checkResult.props.fallback['/registery/check'],
    },
  };
};

export default OrganizationTutorialPage;

const Box = styled.div`
  padding: 2rem;
`;

const Inner = styled.div`
  line-height: 1.5;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const FlexEndBox = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const StyledTitle = styled.h1`
  ${flexRowBaseStyle}
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.5;
`;
