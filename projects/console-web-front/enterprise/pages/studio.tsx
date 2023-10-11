import { FeatureTableBase, OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { DeviceId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';

import { getOrganizationInServerSide } from '../../src/api/organization';
import { getProjectInServerSide } from '../../src/api/project';
import { getUserInServerSide } from '../../src/api/registery';
import { getFeatureConfigInServerSide } from '../api/feature';
import StudioLayout from '../components/studio/StudioLayout';

export interface StudioTestingPageProps {
  organization: OrganizationBase;
  project: ProjectBase;
  me: UserBase;
  deviceId: DeviceId;
  feature: FeatureTableBase;
}

export interface CloudStudioTestingPageProps extends Omit<StudioTestingPageProps, 'project'> {}

export const getStudioTestingLayout = (
  page: React.ReactElement<StudioTestingPageProps | CloudStudioTestingPageProps>,
) => {
  return (
    <StudioLayout editionType={page.props.feature.defaultEdition} deviceId={page.props.deviceId}>
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

export const getCloudDeviceStudioTestingServerSideProps: GetServerSideProps<CloudStudioTestingPageProps> = async (
  context,
) => {
  const deviceId = context.query.deviceId as DeviceId | undefined;

  if (!deviceId) {
    return {
      notFound: true,
    };
  }

  try {
    const [organization, user, featureConfig] = await Promise.all([
      getOrganizationInServerSide(context),
      getUserInServerSide(context),
      getFeatureConfigInServerSide(context),
    ]);

    return {
      props: {
        organization,
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
