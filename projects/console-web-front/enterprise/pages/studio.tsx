import { DeviceBase, FeatureTableBase, OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { DeviceId, OrganizationId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';

import { getCloudDeviceByIdInServerSide } from '../../src/api/cloud-device';
import { getDeviceByIdInServerSide } from '../../src/api/device';
import { getOrganizationInServerSide } from '../../src/api/organization';
import { getProjectInServerSide } from '../../src/api/project';
import { getUserInServerSide } from '../../src/api/registery';
import LiveTestingCloseSessionButton from '../../src/components/cloud/LiveTestingCloseSessionButton';
import { getFeatureConfigInServerSide } from '../api/feature';
import StudioLayout from '../components/studio/StudioLayout';

export interface StudioTestingPageProps {
  organization: OrganizationBase;
  project: ProjectBase;
  me: UserBase;
  device: DeviceBase;
  feature: FeatureTableBase;
}

export interface CloudStudioTestingPageProps extends Omit<StudioTestingPageProps, 'project'> {}

export const getStudioTestingLayout = (
  page: React.ReactElement<StudioTestingPageProps | CloudStudioTestingPageProps>,
) => {
  return <StudioLayout device={page.props.device}>{page}</StudioLayout>;
};

export const getCloudStudioTestingLayout = (
  page: React.ReactElement<StudioTestingPageProps | CloudStudioTestingPageProps>,
) => {
  return (
    <StudioLayout
      device={page.props.device}
      headerRight={
        <LiveTestingCloseSessionButton onClose={() => window.close()} type="primary">
          Close session
        </LiveTestingCloseSessionButton>
      }
    >
      {page}
    </StudioLayout>
  );
};

export const getStudioTestingServerSideProps: GetServerSideProps<StudioTestingPageProps> = async (context) => {
  const organizationId = context.query.orgId as OrganizationId | undefined;
  const deviceId = context.query.deviceId as DeviceId | undefined;

  if (!deviceId || !organizationId) {
    return {
      notFound: true,
    };
  }

  try {
    const [organization, project, user, featureConfig, device] = await Promise.all([
      getOrganizationInServerSide(context),
      getProjectInServerSide(context),
      getUserInServerSide(context),
      getFeatureConfigInServerSide(context),
      getDeviceByIdInServerSide(context, organizationId, deviceId),
    ]);

    if (device) {
      return {
        props: {
          organization,
          project,
          me: user,
          device,
          feature: featureConfig,
        },
      };
    }
  } catch (e) {
    return {
      notFound: true,
    };
  }

  return {
    notFound: true,
  };
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
    const [organization, user, featureConfig, device] = await Promise.all([
      getOrganizationInServerSide(context),
      getUserInServerSide(context),
      getFeatureConfigInServerSide(context),
      getCloudDeviceByIdInServerSide(context, deviceId),
    ]);

    if (device) {
      return {
        props: {
          organization,
          me: user,
          device,
          feature: featureConfig,
        },
      };
    }
  } catch (e) {
    return {
      notFound: true,
    };
  }

  return {
    notFound: true,
  };
};
