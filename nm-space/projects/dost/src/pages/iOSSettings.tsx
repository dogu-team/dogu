import { Button, Center, Divider, List, Text } from '@chakra-ui/react';
import { PlatformSerial, Serial } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import ManualExternalToolValidCheckerItem from '../components/external/ManualExternalToolValidCheckerItem';
import BorderBox from '../components/layouts/BorderBox';
import PageTitle from '../components/layouts/PageTitle';
import useManualSetupExternalValidResult from '../hooks/manaul-setup-external-valid-result';
import { ExternalValidationResult } from '../shares/external';
import { ipc } from '../utils/window';

function IosSettings() {
  const { results } = useManualSetupExternalValidResult(['xcode', 'web-driver-agent-build', 'ios-device-agent-build']);
  const [xcodeResult, setXcodeResult] = useState<ExternalValidationResult | null>(null);
  const [platformSerials, setPlatformSerials] = useState<PlatformSerial[]>([]);

  const validateXcode = useCallback(async () => {
    try {
      const result = await ipc.externalClient.validate('xcode');
      setXcodeResult(result);
    } catch (e) {
      ipc.rendererLogger.error(`XcodeValidate error: ${stringify(e)}`);
    }
  }, []);

  const getSerial = useCallback(async () => {
    try {
      const result = await ipc.deviceLookupClient.getPlatformSerials();
      const iosPlatformSerials = result.filter((PlatformSerial) => PlatformSerial.platform === 'ios');
      console.log('serials', result);
      setPlatformSerials(iosPlatformSerials);
    } catch (e) {
      ipc.rendererLogger.error(`Get PlatformSerials error: ${stringify(e)}`);
    }
  }, []);

  useEffect(() => {
    validateXcode();
    getSerial();
  }, []);

  return (
    <div>
      <div style={{ paddingBottom: '16px' }}>
        <PageTitle title="iOS Settings" />
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
              {platformSerials &&
                platformSerials.map((PlatformSerial) => (
                  <Text>
                    {PlatformSerial.platform}, {PlatformSerial.serial}
                  </Text>
                ))}
            </BorderBox>
          )}
          {results?.map((result) => (
            <ManualExternalToolValidCheckerItem key={result.key} isValid={result.isValid} externalKey={result.key} name={result.name} />
          ))}
        </List>
      </Center>
    </div>
  );
}

export default IosSettings;

const MenuTitle = styled(Text)`
  font-size: 1.1rem;
  font-weight: 500;
`;
