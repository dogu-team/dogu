import { FeatureTableBase, OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { DeviceId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';

import { getOrganizationInServerSide } from '../../api/organization';
import { getProjectInServerSide } from '../../api/project';
import { getUserInServerSide } from '../../api/registery';
import { getFeatureConfigInServerSide } from '../api/feature';
import StudioLayout from '../components/studio/StudioLayout';

export interface StudioTestingPageProps {
  organization: OrganizationBase;
  project: ProjectBase;
  me: UserBase;
  deviceId: DeviceId;
  feature: FeatureTableBase;
}

export const getStudioTestingLayout = (page: React.ReactElement<StudioTestingPageProps>) => {
  return (
    <StudioLayout
      editionType={page.props.feature.defaultEdition}
      project={page.props.project}
      deviceId={page.props.deviceId}
    >
      {page}
    </StudioLayout>
  );
};

export const getStudioTestingServerSideProps: GetServerSideProps<StudioTestingPageProps> = async (context) => {
  const deviceId = context.query.deviceId as DeviceId | undefined;

  if (!deviceId) {
    return {
      notFound: true,
    };
  }

  try {
    const [organization, project, user, featureConfig] = await Promise.all([
      getOrganizationInServerSide(context),
      getProjectInServerSide(context),
      getUserInServerSide(context),
      getFeatureConfigInServerSide(context),
    ]);

    return {
      props: {
        organization,
        project,
        me: user,
        deviceId,
        feature: featureConfig,
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
};
