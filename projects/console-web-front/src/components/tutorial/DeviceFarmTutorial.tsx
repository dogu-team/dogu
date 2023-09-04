import { HostBase, ProjectBase } from '@dogu-private/console';
import { HostConnectionState } from '@dogu-private/types';
import { Alert, Button } from 'antd';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getHostByToken, updateUseHostAsDevice } from '../../api/host';
import useModal from '../../hooks/useModal';
import useTutorialContext from '../../hooks/useTutorialContext';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import { getLocaledLink } from '../../utils/locale';
import RefreshButton from '../buttons/RefreshButton';
import TokenCopyInput from '../common/TokenCopyInput';
import CreateHostModal from '../hosts/CreateHostModal';
import GuideAnchor from './GuideAnchor';
import GuideBanner from './GuideBanner';
import GuideLayout from './GuideLayout';
import GuideStep from './GuideStep';
import TutorialDeviceList from './TutorialDeviceLIst';
import CreateProjectModal from '../projects/CreateProjectModal';

const INTRODUCTION_ID = 'introduction';
const CREATE_PROJECT_ID = 'create-project';
const INSTALL_DOGU_AGENT_ID = 'install-dogu-agent';
const CREATE_HOST_ID = 'create-host';
const USE_HOST_AS_DEVICE_ID = 'use-host-as-device';
const CONNECT_MOBILE_DEVICE_ID = 'connect-mobile-device';
const USE_DEVICE_ID = 'use-device';

export const TUTORIAL_PROJECT_SESSION_KEY = 'tutorialProject';
export const TUTORIAL_HOST_SESSION_KEY = 'tutorialHost';

type HostSession = { data: HostBase; token: string };

const DeviceFarmTutorial = () => {
  const router = useRouter();
  const [isProjectModalOpen, openProjectModal, closeProjectModal] = useModal();
  const [isHostModalOpen, openHostModal, closeHostModal] = useModal();
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [host, setHost] = useState<HostBase>();
  const { project, updateProject, organization } = useTutorialContext();

  useEffect(() => {
    if (organization?.organizationId) {
      const projectRaw = sessionStorage.getItem(TUTORIAL_PROJECT_SESSION_KEY);
      const hostRaw = sessionStorage.getItem(TUTORIAL_HOST_SESSION_KEY);

      if (projectRaw) {
        const data = JSON.parse(projectRaw) as ProjectBase;
        if (data.organizationId === organization.organizationId) {
          updateProject(data);
        } else {
          sessionStorage.removeItem(TUTORIAL_PROJECT_SESSION_KEY);
        }
      }

      if (hostRaw) {
        const { data, token } = JSON.parse(hostRaw) as HostSession;
        if (data.organizationId === organization.organizationId) {
          setHost(data);
          setToken(token);
        } else {
          sessionStorage.removeItem(TUTORIAL_HOST_SESSION_KEY);
        }
      }
    }
  }, [organization?.organizationId]);

  useEffect(() => {
    const unsub = useEventStore.subscribe(({ eventName, payload }) => {
      if (eventName === 'onHostCreated') {
        setToken(payload as string);
        if (organization?.organizationId) {
          getHostByToken(organization.organizationId, payload as string).then((host) => {
            setHost(host);
            const hostSession: HostSession = { data: host, token: payload as string };
            sessionStorage.setItem(TUTORIAL_HOST_SESSION_KEY, JSON.stringify(hostSession));
          });
        }
      }
    });

    return () => {
      unsub();
    };
  }, [organization?.organizationId]);

  const handleUseHostAsDevice = async () => {
    if (!organization) {
      return;
    }

    if (!token) {
      sendErrorNotification('Please create a host first.');
      return;
    }

    setLoading(true);

    try {
      const host = await getHostByToken(organization.organizationId, token);
      if (host?.connectionState === HostConnectionState.HOST_CONNECTION_STATE_CONNECTED) {
        await updateUseHostAsDevice(organization.organizationId, host.hostId);
      } else {
        throw new Error('Host is not connected. Please retry after few seconds.');
      }
      sendSuccessNotification('Successfully used host as device.');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to use host as device: ${getErrorMessageFromAxios(e)}`);
      } else if (e instanceof Error) {
        sendErrorNotification(`Failed to use host as device: ${e.message}`);
      }
    }
    setLoading(false);
  };

  const doguAgentDownloadLink =
    process.env.NEXT_PUBLIC_ENV === 'self-hosted'
      ? 'https://github.com/dogu-team/dogu/releases'
      : `${process.env.NEXT_PUBLIC_LANDING_URL}${getLocaledLink(router.locale, '/downloads/dogu-agent')}`;

  return (
    <GuideLayout
      sidebar={
        <GuideAnchor
          items={[
            { id: INTRODUCTION_ID, title: 'Introduction' },
            { id: CREATE_PROJECT_ID, title: 'Create project' },
            { id: INSTALL_DOGU_AGENT_ID, title: 'Install Dogu Agent' },
            { id: CREATE_HOST_ID, title: 'Create host' },
            { id: USE_HOST_AS_DEVICE_ID, title: 'Use host as device' },
            { id: CONNECT_MOBILE_DEVICE_ID, title: 'Connect mobile device' },
            { id: USE_DEVICE_ID, title: 'Use device' },
          ]}
        />
      }
      content={
        <div>
          <GuideStep
            id={INTRODUCTION_ID}
            title="Introduction"
            content={
              <div>
                <p>Dogu provides the Device Farm feature, allowing you to manage devices from various platforms such as Windows, Mac, Android, and iOS in one place.</p>

                <div style={{ marginTop: '.5rem' }}>
                  <p>
                    For more information about the Device Farm, please refer to{' '}
                    <Link href="https://docs.dogutech.io/device-farm/" target="_blank">
                      Device Farm
                    </Link>{' '}
                    and{' '}
                    <Link href="https://docs.dogutech.io/get-started/tutorials/device-farm" target="_blank">
                      Device Farm Tutorial
                    </Link>{' '}
                    document pages.
                  </p>
                </div>
              </div>
            }
          />
          <GuideStep
            id={CREATE_PROJECT_ID}
            title="Create a project"
            content={
              <div>
                {project ? (
                  `Created project: ${project.name}`
                ) : (
                  <div>
                    <Button
                      type="primary"
                      onClick={() => {
                        openProjectModal();
                      }}
                    >
                      Create a project
                    </Button>

                    <CreateProjectModal
                      isOpen={isProjectModalOpen}
                      close={closeProjectModal}
                      onCreate={(result) => {
                        updateProject(result);
                      }}
                    />
                  </div>
                )}
              </div>
            }
          />
          <GuideStep
            id={INSTALL_DOGU_AGENT_ID}
            title="Install Dogu Agent on the host(macOS, Windows)"
            description="Dogu Agent is a software that is installed on the Windows, macOS to help manage devices from the Dogu."
            content={
              <div>
                <div>
                  <Link href={doguAgentDownloadLink} target="_blank">
                    <Button type="primary">Download</Button>
                  </Link>
                </div>

                <div style={{ marginTop: '.5rem' }}>
                  <p>To establish a connection, you will need the host token. Let&apos;s move to the next step for it!</p>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <Alert
                    type="info"
                    showIcon
                    message="For more information, pleae visit Documentation - Device Farm"
                    action={
                      <Link href="https://docs.dogutech.io/get-started/tutorials/device-farm/host" target="_blank">
                        <Button type="link">Visit Docs</Button>
                      </Link>
                    }
                  />
                </div>
              </div>
            }
          />
          <GuideStep
            id={CREATE_HOST_ID}
            title="Create a host"
            description="Host is a computer that is installed Dogu Agent. You can connect devices to the host and use them or use the host as a device."
            content={
              <div>
                {token ? (
                  <HostTokenWrapper>
                    <p>Your host token is...</p>
                    <TokenCopyInput value={token} />
                    <p>Copy and paste it to Dogu Agent, and establish connection.</p>
                  </HostTokenWrapper>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => {
                      if (!project) {
                        sendErrorNotification('Please create a project first.');
                      } else {
                        openHostModal();
                      }
                    }}
                  >
                    Create a host
                  </Button>
                )}
                <CreateHostModal isOpen={isHostModalOpen} close={closeHostModal} />
              </div>
            }
          />

          <GuideStep
            id={USE_HOST_AS_DEVICE_ID}
            title="Use host as a device (Optional)"
            description={'If you like to use host as a device, you can use the host as a device after connection.'}
            content={
              <div>
                <Button onClick={handleUseHostAsDevice} loading={loading} type="primary">
                  Use as a device
                </Button>
              </div>
            }
          />

          <GuideStep
            id={CONNECT_MOBILE_DEVICE_ID}
            title="Connect mobile devices (Optional)"
            description="If you like to use mobile devices, connect Android or iOS devices to the host."
            content={
              <div>
                <p>
                  Before connecting, Please follow{' '}
                  <Link href="https://docs.dogutech.io/device-farm/device/settings" target="_blank">
                    Device Configuration
                  </Link>{' '}
                  document page to connect mobile devices.
                </p>
              </div>
            }
          />

          <GuideStep
            id={USE_DEVICE_ID}
            title="Use devices"
            description={'After using host as a device or connecting device to the host, the device will be marked as standby device. You can use the device by selecting it.'}
            content={
              <div>
                {!!organization && !!host ? (
                  <>
                    <FlexEnd>
                      <RefreshButton />
                    </FlexEnd>

                    <MarginWrapper>
                      <TutorialDeviceList organizationId={organization?.organizationId} hostId={host.hostId} />
                    </MarginWrapper>
                  </>
                ) : (
                  <Alert type="error" message={'For using device, create host and connect with Dogu Agent first'} showIcon />
                )}

                <MarginWrapper>
                  <GuideBanner docsUrl="https://docs.dogutech.io/device-farm" />
                </MarginWrapper>
              </div>
            }
          />
        </div>
      }
    />
  );
};

export default DeviceFarmTutorial;

const HostTokenWrapper = styled.div`
  max-width: 500px;
`;

const FlexEnd = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const MarginWrapper = styled.div`
  margin-top: 0.5rem;
`;
