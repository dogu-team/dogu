import { Center, Divider, List, ListItem, Stack, Text } from '@chakra-ui/react';
import styled from 'styled-components';

import BorderBox from '../components/layouts/BorderBox';
import PageTitle from '../components/layouts/PageTitle';
import MacOsPermissions from '../components/MacOSPermissions';

function MacOSSettings() {
  return (
    <div>
      <div style={{ paddingBottom: '16px' }}>
        <PageTitle title="macOS Settings" />
      </div>

      <Divider mb={4} />
      <Center>
        <List spacing={2} width="100%">
          <ListItem>
            <BorderBox>
              <Stack spacing="8px">
                <div>
                  <MenuTitle>macOS Permissions</MenuTitle>
                  <Text fontSize=".9rem">Following permissions are required to control macOS.</Text>
                </div>
                <MacOsPermissions />
              </Stack>
            </BorderBox>
          </ListItem>
        </List>
      </Center>
    </div>
  );
}

export default MacOSSettings;

const MenuTitle = styled(Text)`
  font-size: 1.1rem;
  font-weight: 500;
`;
