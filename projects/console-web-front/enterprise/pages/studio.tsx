import { DeviceBase, OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { DeviceId, LiveSessionId, OrganizationId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { getCloudDeviceByIdInServerSide } from '../../src/api/cloud-device';
import { getDeviceByIdInServerSide } from '../../src/api/device';
import { getOrganizationInServerSide } from '../../src/api/organization';
import { getProjectInServerSide } from '../../src/api/project';
import { getUserInServerSide } from '../../src/api/registery';
import LiveTestingFeedbackButton from '../../src/components/cloud/LiveTestingFeedbackButton';
import LiveTestingCloseSessionButton from '../../src/components/cloud/LiveTestingCloseSessionButton';
import LiveTestingSessionTimer from '../../src/components/cloud/LiveTestingSessionTimer';
import ParticipantGroup from '../../src/components/studio/ParticipantGroup';
import StudioDeviceSelector from '../../src/components/studio/StudioDeviceSelector';
import StudioLayout from '../components/studio/StudioLayout';

export interface StudioTestingPageProps {
  organization: OrganizationBase;
  // project: ProjectBase;
  me: UserBase;
  device: DeviceBase;
}

export interface CloudStudioTestingPageProps extends Omit<StudioTestingPageProps, 'project'> {}

export const getStudioTestingLayout = (page: React.ReactElement<StudioTestingPageProps>) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();

  return (
    <StudioLayout
      device={page.props.device}
      headerRight={
        <>
          <div style={{ marginRight: '1rem' }}>
            <ParticipantGroup
              organizationId={page.props.organization.organizationId}
              deviceId={page.props.device.deviceId}
              userId={page.props.me.userId}
            />
          </div>
          <StudioDeviceSelector
            selectedDevice={page.props.device ?? undefined}
            organizationId={page.props.organization.organizationId}
            onSelectedDeviceChanged={(device) => {
              if (device) {
                router.push({
                  query: {
                    orgId: router.query.orgId,
                    pid: router.query.pid,
                    deviceId: device?.deviceId,
                    tab: router.query.tab,
                  },
                });
              } else {
                router.push(`/dashboard/${router.query.orgId}/projects/${router.query.pid}/studio`);
              }
            }}
          />
        </>
      }
    >
      {page}
    </StudioLayout>
  );
};

export const getCloudStudioTestingLayout = (page: React.ReactElement<CloudStudioTestingPageProps>) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  const liveSessionId = router.query.sessionId as LiveSessionId;

  return (
    <StudioLayout
      device={page.props.device}
      headerRight={
        <>
          <div style={{ marginRight: '1rem' }}>
            <LiveTestingFeedbackButton sessionId={liveSessionId} userId={page.props.me.userId} />
          </div>
          <div style={{ marginRight: '1rem' }}>
            <LiveTestingSessionTimer
              organizationId={page.props.organization.organizationId}
              sessionId={liveSessionId}
            />
          </div>
          <div style={{ marginRight: '1rem' }}>
            <ParticipantGroup
              organizationId={page.props.organization.organizationId}
              deviceId={page.props.device.deviceId}
              userId={page.props.me.userId}
            />
          </div>
          <LiveTestingCloseSessionButton
            organizationId={page.props.organization.organizationId}
            sessionId={liveSessionId}
            onClose={() => window.close()}
            type="primary"
          >
            Close session
          </LiveTestingCloseSessionButton>
        </>
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
    const [organization, user, device] = await Promise.all([
      getOrganizationInServerSide(context),
      // getProjectInServerSide(context),
      getUserInServerSide(context),
      getDeviceByIdInServerSide(context, organizationId, deviceId),
    ]);

    if (device) {
      return {
        props: {
          organization,
          // project,
          me: user,
          device,
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
  if (process.env.DOGU_RUN_TYPE === 'self-hosted') {
    return {
      notFound: true,
    };
  }

  const deviceId = context.query.deviceId as DeviceId | undefined;

  if (!deviceId) {
    return {
      notFound: true,
    };
  }

  try {
    const [organization, user, device] = await Promise.all([
      getOrganizationInServerSide(context),
      getUserInServerSide(context),
      getCloudDeviceByIdInServerSide(context, deviceId),
    ]);

    if (device) {
      return {
        props: {
          organization,
          me: user,
          device,
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
