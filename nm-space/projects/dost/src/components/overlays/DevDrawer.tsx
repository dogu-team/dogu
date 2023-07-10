import {
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  List,
  ListItem,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { ipc } from '../../utils/window';
import { ChildTree } from '../../shares/child';
import DevChildProcessTree from './DevChildProcessTree';

interface DevDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function DevDrawer(props: DevDrawerProps) {
  const onOpenJsonConfig = () => {
    (async () => {
      await ipc.settingsClient.openJsonConfig();
    })();
  };
  const onOpenWritableDirectoryClicked = () => {
    (async () => {
      await ipc.settingsClient.openWritableDirectory();
    })();
  };

  const onRespawnClicked = () => {
    (async () => {
      try {
        const befHAPort = await ipc.appConfigClient.get('DOGU_DEVICE_SERVER_HOST_PORT');
        await ipc.appConfigClient.set('DOGU_DEVICE_SERVER_HOST_PORT', 'localhost:54321');
        await ipc.appConfigClient.set('DOGU_DEVICE_SERVER_HOST_PORT', befHAPort);
      } catch (e) {
        console.log(e);
      }

      try {
        const befDSPort = await ipc.appConfigClient.get('DOGU_DEVICE_SERVER_PORT');
        await ipc.appConfigClient.set('DOGU_DEVICE_SERVER_PORT', 54321);
        await ipc.appConfigClient.set('DOGU_DEVICE_SERVER_PORT', befDSPort);
      } catch (e) {
        console.log(e);
      }
    })();
  };
  const [isHAActive, setIsHAActive] = useState<boolean>(false);
  const [isDSActive, setIsDSActive] = useState<boolean>(false);
  const [updateDate, setUpdateDate] = useState<Date>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const timer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const checkState = async () => {
      const isHAActive = await ipc.childClient.isActive('host-agent');
      setIsHAActive(isHAActive);
      const isDSActive = await ipc.childClient.isActive('device-server');
      setIsDSActive(isDSActive);
      setUpdateDate(new Date());
    };
    const t = setInterval(async () => await checkState(), 1000);
    timer.current = t;

    return () => {
      clearInterval(timer.current ?? undefined);
    };
  }, []);

  return (
    <>
      <Drawer isOpen={props.isOpen} placement="right" onClose={props.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            DevDrawer <br /> time: {updateDate?.toLocaleTimeString()}
          </DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody>
            <Center>
              <List spacing={3} width="100%">
                <ListItem>
                  <Stack direction={['row']} spacing="20px">
                    <Text width="100%" align="left">
                      Open Json Config
                    </Text>
                    <Button size="sm" onClick={onOpenJsonConfig}>
                      Open
                    </Button>
                  </Stack>
                </ListItem>

                <ListItem>
                  <Stack direction={['row']} spacing="20px">
                    <Text width="100%" align="left">
                      Open Writable Directory
                    </Text>
                    <Button size="sm" onClick={onOpenWritableDirectoryClicked}>
                      Open
                    </Button>
                  </Stack>
                </ListItem>

                <ListItem>
                  <Text width="100%" align="left">
                    isHAActive: {isHAActive.toString()} <br />
                    isDSActive: {isDSActive.toString()}
                  </Text>
                </ListItem>

                <ListItem>
                  <Stack direction={['row']} spacing="20px">
                    <Text width="100%" align="left">
                      Respawn Host Agent & Device Server
                    </Text>
                    <Button size="sm" onClick={onRespawnClicked}>
                      Respawn
                    </Button>
                  </Stack>
                </ListItem>
                <ListItem>
                  <Stack direction={['row']} spacing="20px">
                    <Text width="100%" align="left">
                      Child Processes
                    </Text>
                    <Button size="sm" onClick={onOpen}>
                      Open
                    </Button>
                  </Stack>
                </ListItem>
              </List>
            </Center>
          </DrawerBody>
        </DrawerContent>
        <DevChildProcessTree isOpen={isOpen} onClose={onClose} />
      </Drawer>
    </>
  );
}

export default DevDrawer;
