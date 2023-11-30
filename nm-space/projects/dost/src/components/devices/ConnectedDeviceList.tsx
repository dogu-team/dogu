import { CheckIcon, NotAllowedIcon } from '@chakra-ui/icons';
import { CircularProgress, HStack, IconButton, List, ListItem, Spacer, Spinner, Text, Tooltip, UnorderedList, useDisclosure, useToast } from '@chakra-ui/react';
import { DeviceConnectionState, findDeviceModelNameByModelId, Platform, platformTypeFromPlatform } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { DeviceConnectionSubscribeReceiveMessage } from '@dogu-tech/device-client-common';
import { AiOutlineCode } from 'react-icons/ai';
import { ipc } from '../../utils/window';
import BorderBox from '../layouts/BorderBox';
import DevicePlatformIcon from './DevicePlatformIcon';
import { DeviceTokenAlert } from '../overlays/DeviceTokenAlert';

function getConnectedDeviceByPlatform(messages: DeviceConnectionSubscribeReceiveMessage[]): { platform: Platform; count: number }[] {
  const platforms: { platform: Platform; count: number }[] = [];
  for (const message of messages) {
    if (message.state !== DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED) continue;
    const platform = message.platform;
    const index = platforms.findIndex((p) => p.platform === platform);
    if (index === -1) {
      platforms.push({ platform, count: 1 });
    } else {
      platforms[index].count++;
    }
  }

  return platforms;
}

const ConnectedDeviceList = () => {
  const [deviceStatuses, setDeviceStatuses] = useState<DeviceConnectionSubscribeReceiveMessage[]>([]);
  const connectedDeviceByPlatforms = deviceStatuses.length > 5 ? getConnectedDeviceByPlatform(deviceStatuses) : [];
  const { isOpen: isDeviceTokenAlertOpen, onOpen: onDeviceTokenAlertOpen, onClose: onDeviceTokenAlertClose } = useDisclosure();
  const [selectedSerial, setSelectedSerial] = useState<string>('');

  useEffect(() => {
    const reload = async () => {
      try {
        const deviceSubscribeMessages = await ipc.deviceLookupClient.getSubscribeMessages();
        setDeviceStatuses(deviceSubscribeMessages);
      } catch (e) {
        ipc.rendererLogger.error(`Get PlatformSerials error: ${stringify(e)}`);
      }
    };
    reload();

    const timer = setInterval(() => {
      reload();
    }, 2000);
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
          <HStack w="100%" justifyContent="end">
            <Spacer />
            {connectedDeviceByPlatforms &&
              connectedDeviceByPlatforms.map((device) => (
                <HStack key={device.platform}>
                  <Text fontSize="xs">
                    <DevicePlatformIcon platform={platformTypeFromPlatform(device.platform)} />
                  </Text>
                  <Text fontSize="xs">{device.count}</Text>
                </HStack>
              ))}
          </HStack>
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
                    <Tooltip label={platformTypeFromPlatform(device.platform)} aria-label="platform" placement="top">
                      <Text fontSize="large">
                        <DevicePlatformIcon platform={platformTypeFromPlatform(device.platform)} />
                      </Text>
                    </Tooltip>
                    <Text fontSize="small">{device.model.length > 0 ? findDeviceModelNameByModelId(device.model) ?? device.model : device.serial}</Text>
                    <Tooltip label="Create an environment variables.">
                      <IconButton
                        size="xs"
                        icon={<AiOutlineCode />}
                        aria-label={'device-code-icon'}
                        background="transparent"
                        onClick={() => {
                          setSelectedSerial(device.serial);
                          onDeviceTokenAlertOpen();
                        }}
                      />
                    </Tooltip>
                  </HStack>
                  {0 < device.errorMessage.length && (
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
      <DeviceTokenAlert serial={selectedSerial} isOpen={isDeviceTokenAlertOpen} onClose={onDeviceTokenAlertClose} />
    </>
  );
};

export default ConnectedDeviceList;

const MenuTitle = styled(Text)`
  font-size: 1.1rem;
  font-weight: 500;
`;
