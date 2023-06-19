import { Button, Center, Divider, List, ListItem, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PageTitle from '../components/layouts/PageTitle';

import MacOsPermissions from '../components/MacOSPermissions';
import { DoguDocsUrl } from '../shares/constants';
import useEnvironmentStore from '../stores/environment';
import { ipc } from '../utils/window';

function TroubleShoot() {
  const platform = useEnvironmentStore((state) => state.platform);
  const navigate = useNavigate();

  const onClickDoguDocs = async () => {
    await ipc.settingsClient.openExternal(DoguDocsUrl);
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
            <Stack spacing="8px">
              <div>
                <MenuTitle>macOS Permissions</MenuTitle>
                <Text fontSize=".9rem">Following permissions are required to control macOS.</Text>
              </div>
              <MacOsPermissions />
            </Stack>
          ) : null}

          <ListItem>
            <MenuTitle>Diagnose packages</MenuTitle>
            <Button size="sm" onClick={() => navigate('/doctor')} mt="8px">
              Dost doctor
            </Button>
          </ListItem>

          <ListItem>
            <MenuTitle>Dogu documents</MenuTitle>
            <Button size="sm" onClick={onClickDoguDocs} mt="8px">
              Open docs website
            </Button>
          </ListItem>

          <ListItem>
            <MenuTitle>WebDriverAgent</MenuTitle>
            <Button
              size="sm"
              onClick={() => {
                ipc.settingsClient.openWdaProject().catch((error) => {
                  ipc.rendererLogger.error('Failed to open WDA project', { error });
                });
              }}
              mt="8px"
            >
              Open WebDriverAgent project
            </Button>
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
