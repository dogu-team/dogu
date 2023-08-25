import { errorify } from '@dogu-tech/common';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import useHostAgentConnectionStatusStore from '../../stores/host-agent-connection-status';
import { ipc } from '../../utils/window';

import HeaderWithMenu from './HeaderWithMenu';
import HomeMenuSider from './HomeMenuSider';

const HomeLayout = () => {
  const setHAConnectionStatus = useHostAgentConnectionStatusStore((state) => state.setStatus);

  useEffect(() => {
    setInterval(() => {
      ipc.childClient
        .getHostAgentConnectionStatus()
        .then((connectionStatus) => {
          setHAConnectionStatus(connectionStatus);
        })
        .catch((error) => {
          ipc.rendererLogger.error('Error while getting host connection status', { error: errorify(error) });
        });
    }, 2000);
  }, []);

  return (
    <Box>
      <HeaderWithMenu />

      <FlexRow>
        <HomeMenuSider />

        <OutletWrapper>
          <Outlet />
        </OutletWrapper>
      </FlexRow>
    </Box>
  );
};

export default HomeLayout;

const Box = styled.div`
  width: 100%;
  height: 100%;
`;

const FlexRow = styled.div`
  display: flex;
  height: calc(100% - 42px);
`;

const OutletWrapper = styled.div`
  padding: 1rem;
  width: 100%;
  height: 100%;
  overflow: auto;
`;
