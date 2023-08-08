import { Button, Checkbox, List, ListItem, Radio, RadioGroup, Stack, Text, useColorMode, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ApiUrlInputForm from '../components/connection/ApiUrlInputForm';

import PageTitle from '../components/layouts/PageTitle';
import SinglePageLayout from '../components/layouts/SinglePageLayout';
import useEnvironmentStore from '../stores/environment';
import { logger } from '../utils/logger';
import { ipc } from '../utils/window';

function Settings() {
  const { showApiUrlInput } = useEnvironmentStore((state) => state.features);
  const [startupAtLogin, setStartupAtLogin] = useState<boolean | null>(null);
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const loginItemSettings = await ipc.settingsClient.getLoginItemSettings({});
      logger.debug('General. loginItemSettings', { loginItemSettings });
      if (null === startupAtLogin) {
        setStartupAtLogin(loginItemSettings.openAtLogin);
        return;
      }
      if (loginItemSettings.openAtLogin !== startupAtLogin) {
        await ipc.settingsClient.setLoginItemSettings({ openAtLogin: startupAtLogin });
      }
    })();
  }, [startupAtLogin]);

  return (
    <SinglePageLayout title={<PageTitle title="Settings" closable />}>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        General
      </Text>

      <List spacing={6} width="100%">
        <ListItem>
          <Stack direction={['row']} spacing="4px">
            <Checkbox isChecked={startupAtLogin ?? false} onChange={(e) => setStartupAtLogin(e.target.checked)}>
              <Text width="100%" align="left">
                Start Dogu Agent when you log in
              </Text>
            </Checkbox>
          </Stack>
        </ListItem>

        <ListItem>
          <Stack direction="column" spacing="4px">
            <MenuTitle>Theme for Dogu Agent</MenuTitle>
            <RadioGroup
              value={colorMode}
              onChange={(value) => {
                if (value !== colorMode) {
                  toggleColorMode();
                }
              }}
            >
              <Stack direction="row" spacing={5}>
                <Radio value="dark">Dark</Radio>
                <Radio value="light">Light</Radio>
              </Stack>
            </RadioGroup>
          </Stack>
        </ListItem>

        {showApiUrlInput && (
          <ListItem>
            <Stack direction="column" spacing="4px">
              <MenuTitle>Custom API URL</MenuTitle>
              <ApiUrlInputForm />
            </Stack>
          </ListItem>
        )}
        <ListItem>
          <Button onClick={() => navigate('/open-source-software-notice')}>Open Source Software Notice</Button>
        </ListItem>
      </List>
    </SinglePageLayout>
  );
}

export default Settings;

const MenuTitle = styled(Text)`
  font-size: 1.1rem;
  font-weight: 600;
`;
