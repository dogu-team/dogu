import { Divider, Flex, HStack, List, ListItem, Spinner, Stack, Text, UnorderedList } from '@chakra-ui/react';
import { CheckIcon, NotAllowedIcon } from '@chakra-ui/icons';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import AlertModalButton from '../components/buttons/AlertModalButton';
import HostAgentConnectionStatusBadge from '../components/connection/HostAgentConnectionStatusBadge';
import TokenConnectionForm from '../components/connection/TokenConnectionForm';
import PageTitle from '../components/layouts/PageTitle';
import useHostAgentConnectionStatusStore from '../stores/host-agent-connection-status';
import { ipc } from '../utils/window';
import { stringify } from '@dogu-tech/common';
import { DeviceSystemInfo, ErrorDevice, PlatformSerial, PlatformType, Serial } from '@dogu-private/types';
import BorderBox from '../components/layouts/BorderBox';

interface DeviceStatus {
  platform: PlatformType;
  serial: Serial;
  error: Error | null;
  info: DeviceSystemInfo | null;
}

function Connect() {
  const hostAgentConnectionStatus = useHostAgentConnectionStatusStore((state) => state.status);
  const [deviceStatuses, setDeviceStatuses] = useState<DeviceStatus[]>([]);

  const tokenInputable = hostAgentConnectionStatus?.status === 'is-token-empty' || hostAgentConnectionStatus?.status === 'disconnected';
  const isConnecting = hostAgentConnectionStatus?.status === 'connecting';
  const isConnected = hostAgentConnectionStatus?.status === 'connected';
  const getSerial = useCallback(async () => {
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
        console.log(`error`, errorDevice.error);
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
    getSerial();
  }, []);

  return (
    <div>
      <div style={{ paddingBottom: '16px' }}>
        <PageTitle title="Connection" />
      </div>

      <Divider mb={4} />

      <List spacing="20px">
        {/* {useApiUrlInput && (
          <ListItem>
            <ApiUrlInputForm />
          </ListItem>
        )} */}

        <ListItem>
          <Flex direction="row" alignItems="center">
            <MenuTitle style={{ marginRight: '.25rem' }}>Dogu connection status:</MenuTitle>
            {hostAgentConnectionStatus === null ? <div>loading...</div> : <HostAgentConnectionStatusBadge status={hostAgentConnectionStatus} />}
          </Flex>

          {isConnecting && (
            <Item>
              <Flex alignItems="center">
                Connecting...
                <Spinner />
              </Flex>
            </Item>
          )}

          {hostAgentConnectionStatus && tokenInputable && (
            <Item>
              <TokenConnectionForm
              // notInputable={!(useApiUrlInput ? apiUrl.length > 0 : true)}
              // onBeforeSubmit={() => {
              //   ipc.appConfigClient.set('DOGU_API_BASE_URL', apiUrl);
              // }}
              />
            </Item>
          )}
        </ListItem>

        {isConnected && (
          <ListItem>
            <MenuTitle>Reconnect with new token</MenuTitle>
            <Item>
              <AlertModalButton
                buttonTitle="Reconnect"
                modalHeader="Reconnect with new token?"
                modalBody={
                  <div>
                    <p>Are you sure to reconnect with new token?</p>
                    <p>Current connection will be disconnected and may affect current works.</p>
                    <div style={{ marginTop: '.5rem' }}>
                      <TokenConnectionForm />
                    </div>
                  </div>
                }
              />
            </Item>
          </ListItem>
        )}
        {isConnected && (
          <BorderBox>
            <List spacing={3}>
              {deviceStatuses &&
                deviceStatuses.map((deviceStatus) => (
                  <ListItem>
                    <HStack>
                      {deviceStatus.error ? <NotAllowedIcon color="red.500" /> : <CheckIcon color="green.500" />}
                      <Text>{deviceStatus.platform}</Text>
                      <Text>{deviceStatus.info?.system.model ?? deviceStatus.serial}</Text>
                    </HStack>
                    {deviceStatus.error && (
                      <UnorderedList>
                        <ListItem>{stringify(deviceStatus.error)}</ListItem>
                      </UnorderedList>
                    )}
                  </ListItem>
                ))}
            </List>
          </BorderBox>
        )}
      </List>
    </div>
  );
}

export default Connect;

const MenuTitle = styled(Text)`
  font-size: 1.1rem;
  font-weight: 500;
`;

const Item = styled.div`
  margin-top: 8px;
`;
