import { OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { getOrganizationInServerSide } from '../../../../src/api/organization';
import { getProjectListInServerSide } from '../../../../src/api/project';
import ConsoleBasicLayout from '../../../../src/components/layouts/ConsoleBasicLayout';
import SdkSelectBox from '../../../../src/components/tutorial/SdkSelectBox';
import Tutorial from '../../../../src/components/tutorial/Tutorial';
import { TutorialContext } from '../../../../src/hooks/useTutorialContext';
import { GuideSupportSdk, tutorialData } from '../../../../src/resources/guide';
import { redirectWithLocale } from '../../../../src/ssr/locale';
import { checkUserVerifiedInServerSide } from '../../../../src/utils/auth';
import { NextPageWithLayout } from '../../../_app';

interface ServerSideProps {
  organization: OrganizationBase;
  me: UserBase;
  projects: ProjectBase[];
}

const OrganizationTutorialPage: NextPageWithLayout<ServerSideProps> = ({ organization, projects, me }) => {
  const router = useRouter();
  const isSdkSelected = !!router.query.sdk && Object.keys(tutorialData).includes(router.query.sdk as string) && !!router.query.framework;

  return (
    <TutorialContext.Provider
      value={{
        organization,
        project: projects[0] ?? null,
        me,
      }}
    >
      <Head>
        <title>Tutorial - {organization.name} | Dogu</title>
      </Head>
      {isSdkSelected ? (
        <Box>
          <Tutorial selectedSdk={router.query.sdk as GuideSupportSdk} />
        </Box>
      ) : (
        <CenteredBox>
          <SdkSelectBox />
        </CenteredBox>
      )}
    </TutorialContext.Provider>
  );
};

OrganizationTutorialPage.getLayout = (page) => {
  return <ConsoleBasicLayout>{page}</ConsoleBasicLayout>;
};

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async (context) => {
  const [organization, checkResult, projectData] = await Promise.all([
    getOrganizationInServerSide(context),
    checkUserVerifiedInServerSide(context),
    getProjectListInServerSide(context, { page: 1, offset: 10 }),
  ]);

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
      projects: projectData.items,
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
