import { Flex, Spacer, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import Footer from '../components/Footer';
import Settings from './Settings';
import TroubleShoot from './TroubleShoot';

function Home() {
  return (
    <>
      <Flex flexDirection="column" w="100%" h="100%">
        <Tabs size="md" align="center" p="1">
          <TabList>
            <Tab>General</Tab>
            <Tab>TroubleShoot</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Settings />
            </TabPanel>
            <TabPanel>
              <TroubleShoot />
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Spacer />
      </Flex>
    </>
  );
}

export default Home;
