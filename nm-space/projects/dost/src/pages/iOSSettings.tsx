import { Box, Button, Center, Divider, List, ListItem, Stack, Text, UnorderedList, useDisclosure } from '@chakra-ui/react';
import { stringify } from '@dogu-tech/common';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ExternalCommandInstallerModal from '../components/external/ExternalCommandInstallerModal';
import ManaulExternalToolSolution from '../components/external/ManualExternalToolSolution';
import ManualExternalToolValidCheckerItem from '../components/external/ManualExternalToolValidCheckerItem';
import PageTitle from '../components/layouts/PageTitle';

import useManualSetupExternalValidResult from '../hooks/manaul-setup-external-valid-result';
import { ExternalValidationResult } from '../shares/external';
import { ipc } from '../utils/window';

function IosSettings() {
  const { results } = useManualSetupExternalValidResult(['xcode']);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [wdaResult, setWdaResult] = useState<ExternalValidationResult | null>(null);

  const validateWda = useCallback(async () => {
    try {
      const result = await ipc.externalClient.validateCommandResult('web-driver-agent-build');
      setWdaResult(result);
    } catch (e) {
      ipc.rendererLogger.error(`WdaValidate error: ${stringify(e)}`);
    }
  }, []);

  useEffect(() => {
    validateWda();
  }, []);

  return (
    <div>
      <div style={{ paddingBottom: '16px' }}>
        <PageTitle title="iOS Settings" />
      </div>

      <Divider mb={4} />

      <Center>
        <List spacing={4} width="100%">
          {results?.map((result) => (
            <Box border="1px" borderColor="rgba(255, 255,255, 0.4)" p={4} rounded="md">
              <ManualExternalToolValidCheckerItem
                key={result.key}
                isValid={result.isValid}
                externalKey={result.key}
                name={result.name}
                solution={<ManaulExternalToolSolution externalKey={result.key} />}
              />
            </Box>
          ))}

          <ListItem>
            <Box border="1px" borderColor="rgba(255, 255,255, 0.4)" p={4} rounded="md">
              <MenuTitle>WebDriverAgent</MenuTitle>
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
            </Box>
          </ListItem>

          <ListItem>
            <Box border="1px" borderColor="rgba(255, 255,255, 0.4)" p={4} rounded="md">
              <MenuTitle>IosDeviceAgent</MenuTitle>
              <Button
                size="sm"
                onClick={() => {
                  ipc.settingsClient.openWdaProject().catch((error) => {
                    ipc.rendererLogger.error('Failed to open WDA project', { error });
                  });
                }}
                mt="8px"
              >
                Open IosDeviceAgent project
              </Button>
            </Box>
          </ListItem>
        </List>
      </Center>

      <ExternalCommandInstallerModal isOpen={isOpen} onClose={onClose} externalKeyAndNames={[{ key: 'web-driver-agent-build', name: 'WebDriverAgentBuild' }]} />
    </div>
  );
}

export default IosSettings;

const MenuTitle = styled(Text)`
  font-size: 1.1rem;
  font-weight: 500;
`;
