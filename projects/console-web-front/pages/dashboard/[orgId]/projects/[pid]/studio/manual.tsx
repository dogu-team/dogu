import { OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { DeviceId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';
import styled from 'styled-components';

import { getOrganizationInServerSide } from 'src/api/organization';
import { getProjectInServerSide } from 'src/api/project';
import { getUserInServerSide } from 'src/api/registery';
import { NextPageWithLayout } from 'pages/_app';
import StudioLayout from 'src/components/studio/StudioLayout';
import ManualTesting from '../../../../../../src/components/studio/ManualTesting';

interface StudioToolServerSideProps {
  organization: OrganizationBase;
  project: ProjectBase;
  me: UserBase;
  deviceId: DeviceId | null;
}

const StudioManualPage: NextPageWithLayout<StudioToolServerSideProps> = ({ organization, project, me, deviceId }) => {
  if (!deviceId) {
    return <div>Select your device first</div>;
  }

  return (
    <Box>
      <ManualTesting organization={organization} project={project} deviceId={deviceId} />
    </Box>
  );
};

StudioManualPage.getLayout = (page) => {
  return (
    <StudioLayout project={page.props.project} deviceId={page.props.deviceId}>
      {page}
    </StudioLayout>
  );
};

export const getServerSideProps: GetServerSideProps<StudioToolServerSideProps> = async (context) => {
  try {
    const [organization, project, user] = await Promise.all([getOrganizationInServerSide(context), getProjectInServerSide(context), getUserInServerSide(context)]);

    return {
      props: {
        organization,
        project,
        me: user,
        deviceId: (context.query.deviceId as DeviceId) ?? null,
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
};

export default StudioManualPage;

const Box = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  flex: 1;
`;
