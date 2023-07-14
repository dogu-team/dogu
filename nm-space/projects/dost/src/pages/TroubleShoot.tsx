import { Box, Button, Center, Divider, List, ListItem, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BorderBox from '../components/layouts/BorderBox';
import PageTitle from '../components/layouts/PageTitle';

import MacOsPermissions from '../components/MacOSPermissions';
import { DoguDocsDeviceConfigurationUrl, DoguDocsDeviceTroubleShootingUrl } from '../shares/constants';
import useEnvironmentStore from '../stores/environment';
import { ipc } from '../utils/window';

function TroubleShoot() {
  const platform = useEnvironmentStore((state) => state.platform);
  const navigate = useNavigate();

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
        <List spacing={4} width="100%">
          {platform && platform === 'darwin' ? (
            <BorderBox>
              <Stack spacing="8px">
                <div>
                  <MenuTitle>macOS Permissions</MenuTitle>
                  <Text fontSize=".9rem">Following permissions are required to control macOS.</Text>
                </div>
                <MacOsPermissions />
              </Stack>
            </BorderBox>
          ) : null}

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
                <MenuTitle>Dogu documents</MenuTitle>
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
        </List>
      </Center>
    </div>
  );
}

export default TroubleShoot;

const MenuTitle = styled(Text)`
  font-size: 1.1rem;
  font-weight: 500;
`;
