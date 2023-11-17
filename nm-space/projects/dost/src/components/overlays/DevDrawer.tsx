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
import DevAppConfigs from './DevAppConfigs';
import { stringify } from '@dogu-tech/common';

interface DevDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function DevDrawer(props: DevDrawerProps) {
  const onOpenWritableDirectoryClicked = () => {
    (async () => {
      await ipc.settingsClient.openWritableDirectory();
    })();
  };

  const onRespawnClicked = () => {
    console.log('onRespawnClicked');
  };
  const [isHAActive, setIsHAActive] = useState<boolean>(false);
  const [isDSActive, setIsDSActive] = useState<boolean>(false);
  const [updateDate, setUpdateDate] = useState<Date>();
  const { isOpen: isOpenChildProc, onOpen: onOpenChildProc, onClose: onCloseChildProc } = useDisclosure();
  const { isOpen: isOpenAppConfig, onOpen: onOpenAppConfig, onClose: onCloseAppConfig } = useDisclosure();
  const [isServicesOpened, setIsServicesOpened] = useState(false);

  const timer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isServicesOpened) {
      return;
    }

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
  }, [isServicesOpened]);

  const checkServicesOpened = () => {
    (async () => {
      const isServicesOpened = await ipc.appStatusClient.isServicesOpened();
      if (isServicesOpened) {
        setIsServicesOpened(isServicesOpened);
      } else {
        setTimeout(checkServicesOpened, 1000);
      }
    })().catch((e) => {
      ipc.rendererLogger.error(`Error while checking services opened in InvalidAppLocation: ${stringify(e)}`);
    });
  };

  useEffect(() => {
    checkServicesOpened();
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
                      DevTools
                    </Text>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        ipc.windowClient.openDevTools().catch((e) => {
                          console.log(e);
                        });
                      }}
                    >
                      Open
                    </Button>
                  </Stack>
                </ListItem>
                <ListItem>
                  <Stack direction={['row']} spacing="20px">
                    <Text width="100%" align="left">
                      AppConfig
                    </Text>
                    <Button size="sm" onClick={onOpenAppConfig}>
                      Open
                    </Button>
                  </Stack>
                </ListItem>
                <ListItem>
                  <Stack direction={['row']} spacing="20px">
                    <Text width="100%" align="left">
                      Child Processes
                    </Text>
                    <Button size="sm" onClick={onOpenChildProc}>
                      Open
                    </Button>
                  </Stack>
                </ListItem>
              </List>
            </Center>
          </DrawerBody>
        </DrawerContent>
        <DevAppConfigs isOpen={isOpenAppConfig} onClose={onCloseAppConfig} />
        <DevChildProcessTree isOpen={isOpenChildProc} onClose={onCloseChildProc} />
      </Drawer>
    </>
  );
}

export default DevDrawer;
