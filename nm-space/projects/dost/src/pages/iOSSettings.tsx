import { Button, Center, Divider, Flex, List, Spacer, Stack, Switch, Text, useDisclosure } from '@chakra-ui/react';
import { stringify } from '@dogu-tech/common';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import ManualExternalToolValidCheckerItem from '../components/external/ManualExternalToolValidCheckerItem';
import BorderBox from '../components/layouts/BorderBox';
import PageTitle from '../components/layouts/PageTitle';
import { RestartAlert } from '../components/overlays/RestartAlert';
import { DoguDocsDeviceFarmIosSettingsUrl } from '../shares/constants';
import { ExternalKey, ExternalValidationResult } from '../shares/external';
import useIosSettingsStatus from '../stores/ios-settings-status';
import { ipc } from '../utils/window';

function IosSettings() {
  const [xcodeResult, setXcodeResult] = useState<ExternalValidationResult | null>(null);
  const [isRestartIosOnInit, setIsRestartIosOnInit] = useState(false);
  const { iosStatus, setIosStatus } = useIosSettingsStatus();
  const { isOpen: isRestartOpen, onOpen: onRestartOpen, onClose: onRestartClose } = useDisclosure();

  const onValidateEnd = useCallback(
    (key: ExternalKey, validateResult: ExternalValidationResult) => {
      const newStatus = iosStatus?.map((status) => {
        if (status.key === key) {
          return {
            ...status,
            isValid: validateResult.valid,
            error: validateResult.error,
          };
        }
        return status;
      });
      if (key === 'ios-device-agent-build' && validateResult.valid) {
        const beforeStatus = iosStatus?.find((status) => status.key === key);
        if (beforeStatus && beforeStatus.isValid === false) {
          onRestartOpen();
        }
      }
      setIosStatus(newStatus);
    },
    [iosStatus],
  );

  const validateXcode = useCallback(async () => {
    try {
      const result = await ipc.externalClient.validate('xcode');
      setXcodeResult(result);
    } catch (e) {
      ipc.rendererLogger.error(`XcodeValidate error: ${stringify(e)}`);
    }
  }, []);

  const loadConfig = async () => {
    try {
      const isRestart = await ipc.appConfigClient.getOrDefault<boolean>('DOGU_DEVICE_IOS_RESTART_ON_INIT', false);
      setIsRestartIosOnInit(isRestart);
    } catch (e) {
      ipc.rendererLogger.error('Error while getting DOGU_DEVICE_IOS_RESTART_ON_INIT', { error: e });
    }
  };

  const onIosRestartChange = async (checked: boolean) => {
    try {
      await ipc.appConfigClient.set<boolean>('DOGU_DEVICE_IOS_RESTART_ON_INIT', checked);
      setIsRestartIosOnInit(checked);
      onRestartOpen();
    } catch (e) {
      ipc.rendererLogger.error('Error while setting DOGU_DEVICE_IOS_RESTART_ON_INIT', { error: e });
    }
  };

  useEffect(() => {
    validateXcode();
    loadConfig();
  }, []);

  return (
    <div>
      <div style={{ paddingBottom: '16px' }}>
        <PageTitle title="iOS Settings" docsLink={DoguDocsDeviceFarmIosSettingsUrl} />
      </div>

      <Divider mb={4} />

      <Center>
        <List spacing={2} width="100%">
          {xcodeResult && (
            <BorderBox>
              <Button
                onClick={() => {
                  ipc.settingsClient.openExternal('xcdevice://showDevicesWindow');
                }}
                width="max-content"
              >
                View Devices and Simulators
              </Button>
            </BorderBox>
          )}
          {iosStatus?.map((result) => (
            <ManualExternalToolValidCheckerItem
              key={result.key}
              isValid={result.isValid}
              error={result.error}
              externalKey={result.key}
              name={result.name}
              onValidateEnd={(validateResult) => onValidateEnd(result.key, validateResult)}
            />
          ))}
          <BorderBox>
            <Stack spacing="8px">
              <MenuTitle>Experimental</MenuTitle>
              <Flex alignItems="center">
                <Text fontSize=".9rem">Restart iOS device when starting a connection</Text>
                <Spacer />
                <Switch size="md" isChecked={isRestartIosOnInit} onChange={(e) => onIosRestartChange(e.target.checked)} />
              </Flex>
            </Stack>
          </BorderBox>
        </List>
      </Center>
      <RestartAlert isOpen={isRestartOpen} onClose={onRestartClose} />
    </div>
  );
}

export default IosSettings;

const MenuTitle = styled(Text)`
  font-size: 1.1rem;
  font-weight: 500;
`;
