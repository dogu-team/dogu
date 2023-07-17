import { OrganizationBase, UserBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { getOrganizationInServerSide } from '../../../../src/api/organization';
import ConsoleBasicLayout from '../../../../src/components/layouts/ConsoleBasicLayout';
import UsageGuide from '../../../../src/components/projects/guides/UsageGuide';
import SdkSelectBox from '../../../../src/components/tutorial/SdkSelectBox';
import { tutorialData } from '../../../../src/resources/guide';
import { checkUserVerifiedInServerSide } from '../../../../src/utils/auth';
import { NextPageWithLayout } from '../../../_app';

interface ServerSideProps {
  organization: OrganizationBase;
  me: UserBase;
}

const OrganizationTutorialPage: NextPageWithLayout<ServerSideProps> = ({ organization, me }) => {
  const router = useRouter();
  const isSdkSelected = !!router.query.sdk && Object.keys(tutorialData).includes(router.query.sdk as string);

  return <Box>{isSdkSelected ? <UsageGuide /> : <SdkSelectBox />}</Box>;
};

OrganizationTutorialPage.getLayout = (page) => {
  return <ConsoleBasicLayout>{page}</ConsoleBasicLayout>;
};

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async (context) => {
  const [organization, checkResult] = await Promise.all([getOrganizationInServerSide(context), checkUserVerifiedInServerSide(context)]);

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
  display: flex;
  height: 100%;
  flex: 1;
  flex-direction: column;
  justify-content: center;
`;
