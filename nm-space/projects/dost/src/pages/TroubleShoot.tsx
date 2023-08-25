import { Box, Button, Center, Divider, List, ListItem, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BorderBox from '../components/layouts/BorderBox';
import PageTitle from '../components/layouts/PageTitle';

import { NetworkSetupModal } from '../components/overlays/NetworkSetupModal';
import { ReportLogAlert } from '../components/overlays/ReportLogAlert';
import { DoguDocsDeviceConfigurationUrl, DoguDocsDeviceTroubleShootingUrl } from '../shares/constants';
import useEnvironmentStore from '../stores/environment';
import { ipc } from '../utils/window';

function TroubleShoot() {
  const { features, platform } = useEnvironmentStore();
  const navigate = useNavigate();
  const { isOpen: isNetworkOpen, onOpen: onNetworkOpen, onClose: onNetworkClose } = useDisclosure();
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();

  const onClickDoguDocsDeviceConfiguration = async () => {
    await ipc.settingsClient.openExternal(DoguDocsDeviceConfigurationUrl);
  };
  const onClickDoguDocsDeviceTroubleShooting = async () => {
    await ipc.settingsClient.openExternal(DoguDocsDeviceTroubleShootingUrl);
  };

  return (
    <div>
      <div style={{ paddingBottom: '16px' }}>
        <PageTitle title="Trouble Shooting" />
      </div>

      <Divider mb={4} />

      <Center>
        <List spacing={2} width="100%">
          <ListItem>
            <BorderBox>
              <MenuTitle>Diagnose packages</MenuTitle>
              <Button size="sm" onClick={() => navigate('/doctor')} mt="8px">
                Dogu Agent doctor
              </Button>
            </BorderBox>
          </ListItem>

          <ListItem>
            <BorderBox>
              <div>
                <MenuTitle>Documents</MenuTitle>
                <Text fontSize=".9rem">If you have problems connecting your device, please check the articles below.</Text>
              </div>
              <Stack direction={['row']} spacing="10px" align={'baseline'}>
                <Button size="sm" onClick={onClickDoguDocsDeviceConfiguration} mt="8px">
                  Device Configuration
                </Button>
                <Button size="sm" onClick={onClickDoguDocsDeviceTroubleShooting} mt="8px">
                  Device TroubleShooting
                </Button>
              </Stack>
            </BorderBox>
          </ListItem>
          {features.showTLSAuthReject ? (
            <ListItem>
              <BorderBox>
                <Stack spacing="8px">
                  <div>
                    <MenuTitle>Network</MenuTitle>
                    <Text fontSize=".9rem">This is a setting to change when there is a network-related problem.</Text>
                    <Button size="sm" onClick={onNetworkOpen} mt="8px">
                      Configuration
                    </Button>
                  </div>
                </Stack>
              </BorderBox>
            </ListItem>
          ) : null}
          <ListItem>
            <BorderBox>
              <div>
                <MenuTitle>Report</MenuTitle>
                <Text fontSize=".9rem">If you encounter any problems, please create a report file and report it.</Text>
              </div>
              <Stack direction={['row']} spacing="10px" align={'baseline'}>
                <Button size="sm" onClick={onReportOpen} mt="8px">
                  Create Report
                </Button>
              </Stack>
            </BorderBox>
          </ListItem>
        </List>
        <NetworkSetupModal isOpen={isNetworkOpen} onClose={onNetworkClose} />
        <ReportLogAlert isOpen={isReportOpen} onClose={onReportClose} />
      </Center>
    </div>
  );
}

export default TroubleShoot;

const MenuTitle = styled(Text)`
  font-size: 1.1rem;
  font-weight: 500;
`;
