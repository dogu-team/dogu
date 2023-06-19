import { Checkbox, List, ListItem, Radio, RadioGroup, Stack, Text, useColorMode } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import PageTitle from '../components/layouts/PageTitle';
import SinglePageLayout from '../components/layouts/SinglePageLayout';
import { logger } from '../utils/logger';
import { ipc } from '../utils/window';

function Settings() {
  const [startupAtLogin, setStartupAtLogin] = useState<boolean | null>(null);
  const { colorMode, toggleColorMode } = useColorMode();

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

      <List spacing={4} width="100%">
        <ListItem>
          <Stack direction={['row']} spacing="8px">
            <Checkbox isChecked={startupAtLogin ?? false} onChange={(e) => setStartupAtLogin(e.target.checked)}>
              <Text width="100%" align="left">
                Start Dost when you log in
              </Text>
            </Checkbox>
          </Stack>
        </ListItem>

        <ListItem>
          <Stack direction="column" spacing="8px">
            <MenuTitle>Theme for Dost</MenuTitle>
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
      </List>
    </SinglePageLayout>
  );
}

export default Settings;

const MenuTitle = styled(Text)`
  font-weight: 500;
`;
