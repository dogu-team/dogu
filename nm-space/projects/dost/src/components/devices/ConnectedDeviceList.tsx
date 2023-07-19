import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { DeviceSystemInfo, PlatformType, Serial } from '@dogu-private/types';
import { CircularProgress, HStack, List, ListItem, Text, Tooltip, UnorderedList } from '@chakra-ui/react';
import { CheckIcon, NotAllowedIcon } from '@chakra-ui/icons';
import { stringify } from '@dogu-tech/common';

import BorderBox from '../layouts/BorderBox';
import { ipc } from '../../utils/window';
import DevicePlatformIcon from './DevicePlatformIcon';

interface DeviceStatus {
  platform: PlatformType;
  serial: Serial;
  error: Error | null;
  info: DeviceSystemInfo | null;
}

const ConnectedDeviceList = () => {
  const [deviceStatuses, setDeviceStatuses] = useState<DeviceStatus[]>([]);

  const getDeviceStatuses = useCallback(async () => {
    try {
      const deviceStatuses: DeviceStatus[] = [];
      const platformSerials = await ipc.deviceLookupClient.getPlatformSerials();
      for (const platformSerial of platformSerials) {
        const info = await ipc.deviceLookupClient.getDeviceSystemInfo(platformSerial.serial);
        if (!info) {
          deviceStatuses.push({
            platform: platformSerial.platform,
            serial: platformSerial.serial,
            error: null,
            info: null,
          });
        } else {
          deviceStatuses.push({
            platform: platformSerial.platform,
            serial: platformSerial.serial,
            error: null,
            info: info,
          });
        }
      }
      const errorDevices = await ipc.deviceLookupClient.getDevicesWithError();
      for (const errorDevice of errorDevices) {
        deviceStatuses.push({
          platform: errorDevice.platform,
          serial: errorDevice.serial,
          error: errorDevice.error,
          info: null,
        });
      }
      setDeviceStatuses(deviceStatuses);
    } catch (e) {
      ipc.rendererLogger.error(`Get PlatformSerials error: ${stringify(e)}`);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      getDeviceStatuses();
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
              deviceStatuses.map((deviceStatus) => (
                <ListItem>
                  <HStack>
                    {deviceStatus.error ? <NotAllowedIcon color="red.500" /> : <CheckIcon color="green.500" />}
                    <Tooltip label={deviceStatus.platform} aria-label="platform" placement="top">
                      <Text fontSize="large">
                        <DevicePlatformIcon platform={deviceStatus.platform} />
                      </Text>
                    </Tooltip>
                    <Text fontSize="small">{deviceStatus.info?.system.model ?? deviceStatus.serial}</Text>
                  </HStack>
                  {deviceStatus.error && (
                    <UnorderedList>
                      <ListItem>
                        <Text fontSize="small">{deviceStatus.error.message}</Text>
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
