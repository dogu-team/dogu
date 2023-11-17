import { Box, Button, Image, Center, Checkbox, CircularProgress, Divider, Flex, Heading, ScaleFade, Spacer, Spinner, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdTroubleshoot } from 'react-icons/md';
import styled from 'styled-components';

import ExternalToolAgreementContent from '../components/external/ExternalToolAgreementContent';
import ExternalToolInstallerModal from '../components/external/ExternalToolInstallerModal';
import PageTitle from '../components/layouts/PageTitle';
import usePlatformSupportedExternalInfo from '../hooks/platform-supported-external-info';
import { ipc } from '../utils/window';
import HeaderIconMenuButon from '../components/layouts/HeaderIconMenuButon';
import { NetworkSetupModal } from '../components/overlays/NetworkSetupModal';
import useEnvironmentStore from '../stores/environment';
import { delay, stringify } from '@dogu-tech/common';
import Header from '../components/layouts/Header';
import logo from '../logo.svg';
import SinglePageLayout from '../components/layouts/SinglePageLayout';
import { Platform } from '../shares/settings';

const InvalidAppLocation = () => {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [isServicesOpened, setIsServicesOpened] = useState(false);

  const onOpenMacosInstallDocs = () => {
    ipc.settingsClient.openExternal('https://docs.dogutech.io/device-farm/host/macos/installation#installation').catch((e) => {
      ipc.rendererLogger.error(`Error while opening external url in InvalidAppLocation: ${stringify(e)}`);
    });
  };

  useEffect(() => {
    if (!isServicesOpened) {
      return;
    }

    (async () => {
      const platform = await ipc.settingsClient.getPlatform();
      setPlatform(platform);
    })().catch((e) => {
      ipc.rendererLogger.error(`Error while getting platform in InvalidAppLocation: ${stringify(e)}`);
    });
  }, [isServicesOpened]);

  const checkServicesOpened = () => {
    (async () => {
      const isServicesOpened = await ipc.appStatusClient.isServicesOpened();
      if (isServicesOpened) {
        setIsServicesOpened(isServicesOpened);
      } else {
        setTimeout(checkServicesOpened, 1000);
      }
    })().catch((e) => {
      ipc.rendererLogger.error(`Error while checking services opened in InvalidAppLocation: ${stringify(e)}`);
    });
  };

  useEffect(() => {
    checkServicesOpened();
  }, []);

  return (
    <SinglePageLayout title={<PageTitle title="Dogu Agent Location Is NOT Valid" />}>
      <Text fontSize={'lg'}>Please move the app to a location where you have write permission.</Text>
      {platform === 'darwin' && (
        <>
          <Text fontSize={'lg'}>
            You can move the app to the <b>Applications</b> folder.
          </Text>
          <Button mt={4} onClick={onOpenMacosInstallDocs}>
            Open Mac OS Installation Document
          </Button>
        </>
      )}
    </SinglePageLayout>
  );
};

export default InvalidAppLocation;
