import { Button, ListItem, Stack, UnorderedList, Text, useDisclosure } from '@chakra-ui/react';
import { ExternalKey } from '../../shares/external';
import { DoguDocsXcodeSettingsUrl } from '../../utils/constants';
import { ipc } from '../../utils/window';
import ExternalToolInstallerModal from './ExternalToolInstallerModal';

interface Props {
  externalKey: ExternalKey;
}

interface ManualExternalToolDetailInfo {
  description?: () => React.ReactNode;
  solution?: () => React.ReactNode;
}

const ManualExternalToolDetail = ({ externalKey }: Props): ManualExternalToolDetailInfo | null => {
  switch (externalKey) {
    case 'xcode':
      return {
        solution: () => (
          <Button
            onClick={() => {
              ipc.settingsClient.openExternal(DoguDocsXcodeSettingsUrl);
            }}
          >
            Open XCode settings document
          </Button>
        ),
      };
    case 'web-driver-agent-build':
      return {
        description: () => {
          const { isOpen, onOpen, onClose } = useDisclosure();
          return (
            <div>
              <UnorderedList width="100%">
                <ListItem>
                  <Stack spacing={1} direction="row" align="center">
                    <Text fontSize={'sm'}> Open</Text>
                    <Button
                      size="sm"
                      onClick={() => {
                        ipc.settingsClient.openWdaProject().catch((error) => {
                          ipc.rendererLogger.error('Failed to open WDA project', { error });
                        });
                      }}
                      mt="8px"
                    >
                      WebDriverAgent project
                    </Button>
                    <Text fontSize={'sm'}> and configure Signing & Capabilities</Text>
                  </Stack>
                </ListItem>
                <ListItem>
                  <Button size="sm" onClick={onOpen} mt="8px">
                    Click here to build
                  </Button>
                </ListItem>
              </UnorderedList>
              <ExternalToolInstallerModal isOpen={isOpen} onClose={onClose} externalKeyAndNames={[{ key: 'web-driver-agent-build', name: 'WebDriverAgent build' }]} />
            </div>
          );
        },
      };
    case 'ios-device-agent-build':
      return {
        description: () => {
          const { isOpen, onOpen, onClose } = useDisclosure();
          return (
            <div>
              <UnorderedList width="100%">
                <ListItem>
                  <Stack spacing={1} direction="row" align="center">
                    <Text fontSize={'sm'}> Open</Text>
                    <Button
                      size="sm"
                      onClick={() => {
                        ipc.settingsClient.openIdaProject().catch((error) => {
                          ipc.rendererLogger.error('Failed to open iOSDeviceAgent project', { error });
                        });
                      }}
                      mt="8px"
                    >
                      iOSDeviceAgent project
                    </Button>
                    <Text fontSize={'sm'}> and configure Signing & Capabilities</Text>
                  </Stack>
                </ListItem>
                <ListItem>
                  <Button size="sm" onClick={onOpen} mt="8px">
                    Click here to build
                  </Button>
                </ListItem>
              </UnorderedList>
              <ExternalToolInstallerModal isOpen={isOpen} onClose={onClose} externalKeyAndNames={[{ key: 'ios-device-agent-build', name: 'IosDeviceAgent build' }]} />
            </div>
          );
        },
      };

    default:
      return null;
  }
};

export default ManualExternalToolDetail;
