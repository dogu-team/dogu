import { Button, Checkbox, Divider, Flex, Spinner, Text, useDisclosure, useEnvironment, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExternalToolAgreementContent from '../components/external/ExternalToolAgreementContent';
import ExternalToolInstallerModal from '../components/external/ExternalToolInstallerModal';

import PageTitle from '../components/layouts/PageTitle';
import usePlatformSupportedExternalInfo from '../hooks/platform-supported-external-info';
import useEnvironmentStore from '../stores/environment';
import { ipc } from '../utils/window';

const SetupInstaller = () => {
  const { externalInfos, getExternalInfos } = usePlatformSupportedExternalInfo();
  const [isAgreed, setIsAgreed] = useState(false);
  const platform = useEnvironmentStore((state) => state.platform);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [isInstalling, setIsInstalling] = useState(false);
  const toast = useToast();

  const externalInfosExcludedManual = externalInfos?.filter((item) => !item.isManualInstallNeeded).filter((item) => !item.result?.valid);

  const handleFinish = async () => {
    setIsAgreed(false);
    setIsInstalling(true);

    const keys = await ipc.externalClient.getSupportedPlatformKeys();
    for (const key of keys) {
      await ipc.externalClient.validate(key);
    }

    const isValid = await ipc.externalClient.isSupportedPlatformValid();

    if (!isValid) {
      toast({
        title: 'Failed to install external tools',
        description: 'Please try again. If this error persists, please contact us.',
        status: 'error',
      });

      setIsInstalling(false);
      return;
    }

    setIsInstalling(false);

    if (platform === 'darwin') {
      navigate('/setup/manual');
      return;
    } else if (platform === 'win32') {
      const [apiUrlInsertable, apiUrl] = await Promise.all([ipc.featureConfigClient.get('apiUrlInsertable'), ipc.appConfigClient.get<string>('DOGU_API_BASE_URL')]);
      if (apiUrlInsertable && !apiUrl) {
        navigate('/setup/config');
        return;
      }
    }

    navigate('/home/connect');
  };

  return (
    <Flex direction="column" style={{ padding: '24px', height: '100%' }}>
      <PageTitle title="Agreements" />

      <Divider mt={6} mb={6} />

      {!!externalInfosExcludedManual ? (
        <>
          <Flex direction="column" justifyContent="space-between" flex={1} height="100%">
            <div>
              <Text fontSize="large" fontWeight="bold">
                Third party agreements
              </Text>

              <div style={{ marginTop: '8px' }}>
                <ExternalToolAgreementContent externalKeys={externalInfosExcludedManual.map((item) => item.key)} />
              </div>
            </div>

            <div>
              <div>
                <Checkbox checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)}>
                  I have read all of the terms and conditions, and I agree with them.
                </Checkbox>
              </div>
              <Flex justifyContent="flex-end" mt={2}>
                <Button colorScheme="blue" isDisabled={!isAgreed || isInstalling} isLoading={isInstalling} onClick={onOpen}>
                  Install
                </Button>
              </Flex>
            </div>
          </Flex>

          <ExternalToolInstallerModal isOpen={isOpen} onClose={onClose} onFinish={handleFinish} externalKeyAndNames={externalInfosExcludedManual} />
        </>
      ) : (
        <Spinner />
      )}
    </Flex>
  );
};

export default SetupInstaller;
