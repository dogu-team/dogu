import { Button, Center, Divider, List, Text } from '@chakra-ui/react';
import { stringify } from '@dogu-tech/common';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import ManualExternalToolValidCheckerItem from '../components/external/ManualExternalToolValidCheckerItem';
import BorderBox from '../components/layouts/BorderBox';
import PageTitle from '../components/layouts/PageTitle';
import { DoguDocsDeviceFarmIosSettingsUrl } from '../shares/constants';
import { ExternalKey, ExternalValidationResult } from '../shares/external';
import useIosSettingsStatus from '../stores/ios-settings-status';
import { ipc } from '../utils/window';

function IosSettings() {
  const [xcodeResult, setXcodeResult] = useState<ExternalValidationResult | null>(null);
  const { iosStatus, setIosStatus } = useIosSettingsStatus();

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

  useEffect(() => {
    validateXcode();
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
