import { OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { getOrganizationInServerSide } from '../../../../src/api/organization';
import { getProjectListInServerSide } from '../../../../src/api/project';
import ConsoleBasicLayout from '../../../../src/components/layouts/ConsoleBasicLayout';
import FrameworkSelectContainer from '../../../../src/components/tutorial/FrameworkSelectContainer';
import SkipTutorialButton from '../../../../src/components/tutorial/SkipTutorialButton';
import UserTutorial from '../../../../src/components/tutorial/UserTutorial';
import { TutorialContext } from '../../../../src/hooks/useTutorialContext';
import { GuideSupportSdk, tutorialData } from '../../../../src/resources/guide';
import { redirectWithLocale } from '../../../../src/ssr/locale';
import { checkUserVerifiedInServerSide } from '../../../../src/utils/auth';
import { NextPageWithLayout } from '../../../_app';

interface ServerSideProps {
  organization: OrganizationBase;
  me: UserBase;
}

const OrganizationTutorialPage: NextPageWithLayout<ServerSideProps> = ({ organization, me }) => {
  const [project, setProject] = useState<ProjectBase>();
  const router = useRouter();
  const isFrameworkSelected = !!router.query.sdk && Object.keys(tutorialData).includes(router.query.sdk as string) && !!router.query.framework;

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
      {isFrameworkSelected ? (
        <Box>
          <UserTutorial selectedSdk={router.query.sdk as GuideSupportSdk} />
        </Box>
      ) : (
        <CenteredBox>
          <FrameworkSelectContainer skipButton={<SkipTutorialButton>Skip tutorial</SkipTutorialButton>} />
        </CenteredBox>
      )}
    </TutorialContext.Provider>
  );
};

OrganizationTutorialPage.getLayout = (page) => {
  return <ConsoleBasicLayout>{page}</ConsoleBasicLayout>;
};

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async (context) => {
  const [organization, checkResult] = await Promise.all([getOrganizationInServerSide(context), checkUserVerifiedInServerSide(context)]);

  if (checkResult.redirect) {
    return checkResult;
  }

  if (checkResult.props.fallback['/registery/check'].isTutorialCompleted === 1) {
    return {
      redirect: redirectWithLocale(context, `/dashboard/${context.query.orgId}/projects`, false),
    };
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

const CenteredBox = styled(Box)`
  display: flex;
  height: 100%;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  background-color: ${(props) => props.theme.main.colors.blue6};
`;
