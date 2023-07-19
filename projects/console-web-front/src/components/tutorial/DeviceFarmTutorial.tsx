import { HostBase } from '@dogu-private/console';
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
import useTutorialSelector from '../../hooks/useTutorialSelector';
import { GuideSupportPlatform, GuideSupportSdk, tutorialData } from '../../resources/guide';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';
import { getLocaledLink } from '../../utils/locale';
import RefreshButton from '../buttons/RefreshButton';
import TokenCopyInput from '../common/TokenCopyInput';
import CreateHostModal from '../hosts/CreateHostModal';
import GuideAnchor from '../projects/guides/GuideAnchor';
import GuideBanner from '../projects/guides/GuideBanner';
import GuideLayout from '../projects/guides/GuideLayout';
import GuideSelectors from '../projects/guides/GuideSelectors';
import GuideStep from '../projects/guides/GuideStep';
import TutorialDeviceList from './TutorialDeviceLIst';

const INTRODUCTION_ID = 'introduction';
const INSTALL_DOGU_AGENT_ID = 'install-dogu-agent';
const CREATE_HOST_ID = 'create-host';
const USE_HOST_AS_DEVICE_ID = 'use-host-as-device';
const CONNECT_MOBILE_DEVICE_ID = 'connect-mobile-device';
const USE_DEVICE_ID = 'use-device';

const DeviceFarmTutorial = () => {
  const router = useRouter();
  const [isOpen, openModal, closeModal] = useModal();
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [host, setHost] = useState<HostBase>();
  const { organization } = useTutorialContext();

  const selectedSdk = (router.query.sdk as GuideSupportSdk | undefined) || GuideSupportSdk.WEBDRIVERIO;
  const guideData = tutorialData[selectedSdk];
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: guideData.defaultOptions.framework,
    defaultPlatform: guideData.defaultOptions.platform,
    defaultTarget: guideData.defaultOptions.target,
  });

  const isMobile = platform === GuideSupportPlatform.ANDROID || platform === GuideSupportPlatform.IOS;

  useEffect(() => {
    const unsub = useEventStore.subscribe(({ eventName, payload }) => {
      if (eventName === 'onHostCreated') {
        setToken(payload as string);
        if (organization?.organizationId) {
          getHostByToken(organization.organizationId, payload as string).then((host) => {
            setHost(host);
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
        sendErrorNotification(`Failed to use host as device: ${getErrorMessage(e)}`);
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
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <GuideSelectors guideData={guideData} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>

          <GuideAnchor
            items={[
              { id: INTRODUCTION_ID, title: 'Introduction' },
              { id: INSTALL_DOGU_AGENT_ID, title: 'Install Dogu Agent' },
              { id: CREATE_HOST_ID, title: 'Create host' },
              isMobile ? { id: CONNECT_MOBILE_DEVICE_ID, title: 'Connect mobile device' } : { id: USE_HOST_AS_DEVICE_ID, title: 'Use host as device' },
              { id: USE_DEVICE_ID, title: 'Use device' },
            ]}
          />
        </div>
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
                  <Button type="primary" onClick={() => openModal()}>
                    Create a host
                  </Button>
                )}
                <CreateHostModal isOpen={isOpen} close={closeModal} />
              </div>
            }
          />

          {isMobile ? (
            <GuideStep
              id={CONNECT_MOBILE_DEVICE_ID}
              title="Connect mobile devices"
              description="Connect Android, iOS devices to the host."
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
          ) : (
            <GuideStep
              id={USE_HOST_AS_DEVICE_ID}
              title="Use host as a device"
              description={'After connecting host to the Dogu, you can use the host as a device.'}
              content={
                <div>
                  <Button onClick={handleUseHostAsDevice} loading={loading} type="primary">
                    Use as a device
                  </Button>
                </div>
              }
            />
          )}

          <GuideStep
            id={USE_DEVICE_ID}
            title="Use devices"
            description={
              isMobile
                ? 'After connecting device to the host, the device will be marked as standby device. You can use the device by selecting it.'
                : 'After using host as a device, the host device will be marked as standby device. You can use the device by selecting it.'
            }
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
