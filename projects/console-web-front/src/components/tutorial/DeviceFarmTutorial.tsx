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
import useOrganizationTutorialContext from '../../hooks/useOrganizationTutorialContext';

import useTutorialSelector from '../../hooks/useTutorialSelector';
import { GuideSupportSdk, tutorialData } from '../../resources/guide';
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

const DeviceFarmTutorial = () => {
  const router = useRouter();
  const [isOpen, openModal, closeModal] = useModal();
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [host, setHost] = useState<HostBase>();
  const { organization } = useOrganizationTutorialContext();

  const selectedSdk = (router.query.sdk as GuideSupportSdk | undefined) || GuideSupportSdk.WEBDRIVERIO;
  const guideData = tutorialData[selectedSdk];
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: guideData.defaultOptions.framework,
    defaultPlatform: guideData.defaultOptions.platform,
    defaultTarget: guideData.defaultOptions.target,
  });

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

          <GuideAnchor items={[]} />
        </div>
      }
      content={
        <div>
          <GuideStep
            id=""
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
            id=""
            title="Install Dogu Agent on the host(macOS, Windows)"
            description="Dogu agent is ..."
            content={
              <div>
                <div>
                  <Link href={doguAgentDownloadLink} target="_blank">
                    <Button type="primary">Download</Button>
                  </Link>
                </div>

                <div>
                  <p>To establish a connection, you will need the host token. Let&apos;s move to the next step for it!</p>
                </div>
              </div>
            }
          />
          <GuideStep
            id=""
            title="Create a host"
            description="Host is..."
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

          <GuideStep
            id=""
            title="Option1: Use host as a device"
            description="Host device..."
            content={
              <div>
                <Button onClick={handleUseHostAsDevice} loading={loading} type="primary">
                  Use as a device
                </Button>
              </div>
            }
          />

          <GuideStep
            id=""
            title="Option2: Connect mobile devices"
            description="Device....."
            content={
              <div>
                <p>
                  Follow{' '}
                  <Link href="https://docs.dogutech.io/device-farm/device/settings" target="_blank">
                    Device Configuration
                  </Link>{' '}
                  document page to connect mobile devices.
                </p>
              </div>
            }
          />

          <GuideStep
            id=""
            title="Use devices"
            description="Use device....."
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
