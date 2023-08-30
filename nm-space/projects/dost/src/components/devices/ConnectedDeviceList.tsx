import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DeviceConnectionState, DeviceSystemInfo, PlatformType, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { Button, CircularProgress, color, HStack, List, ListItem, Spinner, Text, Tooltip, UnorderedList, useToast } from '@chakra-ui/react';
import { CheckIcon, NotAllowedIcon, SpinnerIcon } from '@chakra-ui/icons';
import { stringify } from '@dogu-tech/common';

import BorderBox from '../layouts/BorderBox';
import { ipc } from '../../utils/window';
import DevicePlatformIcon from './DevicePlatformIcon';
import { DeviceConnectionSubscribeReceiveMessage } from '@dogu-tech/device-client-common';

const ConnectedDeviceList = () => {
  const [deviceStatuses, setDeviceStatuses] = useState<DeviceConnectionSubscribeReceiveMessage[]>([]);
  const toast = useToast();
  const onClipboardCopy = (text: string) => {
    ipc.settingsClient.writeTextToClipboard(text);
    toast.closeAll();
    toast({
      title: 'Clipboard',
      description: `Copied ${text} to clipboard`,
      status: 'success',
      duration: 1000,
      isClosable: true,
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      (async () => {
        try {
          const deviceSubscribeMessages = await ipc.deviceLookupClient.getSubscribeMessages();
          console.log('deviceSubscribeMessages', deviceSubscribeMessages);
          setDeviceStatuses(deviceSubscribeMessages);
        } catch (e) {
          ipc.rendererLogger.error(`Get PlatformSerials error: ${stringify(e)}`);
        }
      })();
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <MenuTitle>Devices</MenuTitle>

      {deviceStatuses.length == 0 ? (
        <div>
          <CircularProgress isIndeterminate color="green.300" size="30px" />
        </div>
      ) : (
        <BorderBox>
          <List spacing={3}>
            {deviceStatuses &&
              deviceStatuses.map((device) => (
                <ListItem key={device.serial}>
                  <HStack>
                    {device.state === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTING ? (
                      <Spinner size="sm" color="gray.500" />
                    ) : device.state === DeviceConnectionState.DEVICE_CONNECTION_STATE_ERROR ? (
                      <NotAllowedIcon color="red.500" />
                    ) : (
                      <CheckIcon color="green.500" />
                    )}
                    <Tooltip label={device.platform} aria-label="platform" placement="top">
                      <Text fontSize="large">
                        <DevicePlatformIcon platform={platformTypeFromPlatform(device.platform)} />
                      </Text>
                    </Tooltip>
                    <Text fontSize="small">{device.model}</Text>
                    {device.state === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED ? (
                      <Button colorScheme="teal" variant="link" fontSize="10px" fontWeight="light" textColor="CaptionText" onClick={() => onClipboardCopy(device.serial)}>
                        ({device.serial})
                      </Button>
                    ) : (
                      <Text fontSize="small">{device.serial}</Text>
                    )}
                  </HStack>
                  {device.state === DeviceConnectionState.DEVICE_CONNECTION_STATE_ERROR && (
                    <UnorderedList>
                      <ListItem>
                        <Text fontSize="small">{device.errorMessage}</Text>
                      </ListItem>
                    </UnorderedList>
                  )}
                </ListItem>
              ))}
          </List>
        </BorderBox>
      )}
    </>
  );
};

export default ConnectedDeviceList;

const MenuTitle = styled(Text)`
  font-size: 1.1rem;
  font-weight: 500;
`;
