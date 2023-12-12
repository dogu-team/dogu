import { HostBase, ProjectBase } from '@dogu-private/console';
import { HostConnectionState } from '@dogu-private/types';
import { Alert, Button } from 'antd';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import Trans from 'next-translate/Trans';

import { getHostByToken, updateUseHostAsDevice } from '../../api/host';
import useModal from '../../hooks/useModal';
import useTutorialContext from '../../hooks/context/useTutorialContext';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import RefreshButton from '../buttons/RefreshButton';
import TokenCopyInput from '../common/TokenCopyInput';
import CreateHostModal from '../hosts/CreateHostModal';
import GuideAnchor from './GuideAnchor';
import GuideBanner from './GuideBanner';
import GuideLayout from './GuideLayout';
import GuideStep from './GuideStep';
import TutorialDeviceList from '../../../enterprise/components/device/TutorialDeviceList';
import CreateProjectModal from '../projects/CreateProjectModal';
import DoguText from '../common/DoguText';
import DownloadAgentButton from '../hosts/DownloadAgentButton';
import { DoguDocsUrl } from '../../utils/url';

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
  const { t } = useTranslation('tutorial');

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

  return (
    <GuideLayout
      sidebar={
        <GuideAnchor
          items={[
            { id: INTRODUCTION_ID, title: t('deviceFarmTutorialIntroAnchorTitle') },
            { id: CREATE_PROJECT_ID, title: t('deviceFarmTutorialCreateProjectAnchorTitle') },
            {
              id: INSTALL_DOGU_AGENT_ID,
              title: t('deviceFarmTutorialInstallDoguAgentAnchorTitle'),
            },
            { id: CREATE_HOST_ID, title: t('deviceFarmTutorialCreateHostAnchorTitle') },
            { id: USE_HOST_AS_DEVICE_ID, title: t('deviceFarmTutorialUseHostDeviceAnchorTitle') },
            {
              id: CONNECT_MOBILE_DEVICE_ID,
              title: t('deviceFarmTutorialConnectDeviceAnchorTitle'),
            },
            { id: USE_DEVICE_ID, title: t('deviceFarmTutorialUseDeviceAnchorTitle') },
          ]}
        />
      }
      content={
        <div>
          <GuideStep
            id={INTRODUCTION_ID}
            title={t('deviceFarmTutorialIntroTitle')}
            content={
              <div>
                <p>
                  <Trans i18nKey="tutorial:deviceFarmTutorialIntroDescription" components={{ dogu: <DoguText /> }} />
                </p>

                <div style={{ marginTop: '.5rem' }}>
                  <p>
                    <Trans
                      i18nKey="tutorial:deviceFarmTutorialIntroDetailDescription"
                      components={{
                        dfLink: <Link href={DoguDocsUrl['device-farm']._index()} target="_blank" />,
                        dftLink: <Link href={DoguDocsUrl['get-started'].tutorials['device-farm']()} target="_blank" />,
                      }}
                    />
                  </p>
                </div>
              </div>
            }
          />
          <GuideStep
            id={INSTALL_DOGU_AGENT_ID}
            title={t('deviceFarmTutorialInstallDoguAgentTitle')}
            description={t('deviceFarmTutorialInstallDoguAgentDescription')}
            content={
              <div>
                <div>
                  <DownloadAgentButton type="primary">{t('downloadDoguAgentButtonTitle')}</DownloadAgentButton>
                </div>
              </div>
            }
          />
          <GuideStep
            id={CREATE_HOST_ID}
            title={t('deviceFarmTutorialCreateHostTitle')}
            description={t('deviceFarmTutorialCreateHostDescription')}
            content={
              <div>
                {token ? (
                  <HostTokenWrapper>
                    <p>{t('deviceFarmTutorialCreateHostDoneTokenTitle')}</p>
                    <TokenCopyInput value={token} />
                  </HostTokenWrapper>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => {
                      openHostModal();
                    }}
                  >
                    {t('createHostButtonTitle')}
                  </Button>
                )}
                <CreateHostModal isOpen={isHostModalOpen} close={closeHostModal} />
              </div>
            }
          />

          <GuideStep
            id={USE_HOST_AS_DEVICE_ID}
            title={t('deviceFarmTutorialUseHostDeviceTitle')}
            description={t('deviceFarmTutorialUseHostDeviceDescription')}
            content={
              <div>
                <Button onClick={handleUseHostAsDevice} loading={loading} type="primary">
                  {t('useHostAsDeviceButtonTitle')}
                </Button>
              </div>
            }
          />

          <GuideStep
            id={CONNECT_MOBILE_DEVICE_ID}
            title={t('deviceFarmTutorialConnectDeviceTitle')}
            description={
              <Trans
                i18nKey="tutorial:deviceFarmTutorialConnectDeviceDescription"
                components={{
                  link: <Link href={DoguDocsUrl['device-farm'].device.settings()} target="_blank" />,
                  br: <br />,
                }}
              />
            }
            content={null}
          />

          <GuideStep
            id={USE_DEVICE_ID}
            title={t('deviceFarmTutorialUseDeviceTitle')}
            description={t('deviceFarmTutorialUseDeviceDescription')}
            content={
              <div>
                {!!organization && !!host ? (
                  <>
                    <FlexEnd>
                      <RefreshButton />
                    </FlexEnd>

                    <MarginWrapper>
                      <TutorialDeviceList organizationId={organization.organizationId} hostId={host.hostId} />
                    </MarginWrapper>
                  </>
                ) : (
                  <Alert type="error" message={t('deviceFarmTutorialUseDeviceAlertMessage')} showIcon />
                )}

                <MarginWrapper>
                  <GuideBanner docsUrl={DoguDocsUrl['device-farm']._index()} />
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
