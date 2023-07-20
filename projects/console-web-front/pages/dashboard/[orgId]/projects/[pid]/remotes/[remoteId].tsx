import { RemoteBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import styled from 'styled-components';

import { getRemoteInServerSide } from '../../../../../../src/api/remote';
import ProjectLayout from '../../../../../../src/components/layouts/ProjectLayout';
import withProject, { getProjectPageServerSideProps, ProjectServerSideProps, WithProjectProps } from '../../../../../../src/hoc/withProject';
import { flexRowSpaceBetweenStyle } from '../../../../../../src/styles/box';
import { NextPageWithLayout } from '../../../../../_app';

const RemoteItemPage: NextPageWithLayout<WithProjectProps & { remote: RemoteBase }> = ({ organization, project, remote }) => {
  console.log(remote);

  return (
    <>
      <Head>
        <title>
          Remote report {remote.remoteId} - {project.name} | Dogu
        </title>
      </Head>
      <div>
        <div></div>
      </div>
    </>
  );
};

RemoteItemPage.getLayout = (page) => {
  return <ProjectLayout>{page}</ProjectLayout>;
};

export const getServerSideProps: GetServerSideProps<ProjectServerSideProps & { remote: RemoteBase }> = async (context) => {
  const result = await getProjectPageServerSideProps(context);

  if ('props' in result) {
    try {
      const remoteBase = await getRemoteInServerSide(context);

      return {
        props: {
          ...(result.props as ProjectServerSideProps),
          remote: remoteBase,
        },
      };
    } catch (e) {
      return {
        notFound: true,
      };
    }
  } else {
    return result;
  }
};

export default withProject(RemoteItemPage);

const FlexBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
