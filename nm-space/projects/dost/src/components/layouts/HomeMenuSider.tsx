import { ColorMode, Flex, useColorMode } from '@chakra-ui/react';
import { AiFillExclamationCircle } from 'react-icons/ai';
import { ImConnection, ImMobile2, ImAppleinc } from 'react-icons/im';
import { MdTroubleshoot } from 'react-icons/md';
import styled from 'styled-components';
import useEnvironmentStore from '../../stores/environment';

import useHostAgentConnectionStatusStore from '../../stores/host-agent-connection-status';
import useIosSettingsStatus from '../../stores/ios-settings-status';
import HostAgentConnectionStatusIcon from '../connection/HostAgentConnectionStatusIcon';
import Footer from '../Footer';
import SiderButton from './SiderButton';

const HomeMenuSider = () => {
  const { colorMode } = useColorMode();
  const hostAgentConnectionStatus = useHostAgentConnectionStatusStore((state) => state.status);
  const platform = useEnvironmentStore((state) => state.platform);
  const { iosStatus } = useIosSettingsStatus();

  return (
    <Sider mode={colorMode}>
      <div>
        <SiderButton link="/home/connect" style={{ justifyContent: 'space-between' }}>
          <Flex alignItems="center">
            <ImConnection />
            &nbsp;&nbsp;Connection
          </Flex>
          {hostAgentConnectionStatus === null ? <div></div> : <HostAgentConnectionStatusIcon status={hostAgentConnectionStatus} />}
        </SiderButton>
        {platform && platform === 'darwin' ? (
          <SiderButton link="/home/macos-settings" style={{ justifyContent: 'space-between' }}>
            <Flex alignItems="center">
              <ImAppleinc />
              &nbsp;&nbsp;macOS Settings
            </Flex>
          </SiderButton>
        ) : null}
        {platform && platform === 'darwin' ? (
          <SiderButton link="/home/ios-settings" style={{ justifyContent: 'space-between' }}>
            <Flex alignItems="center">
              <ImMobile2 />
              &nbsp;&nbsp;iOS Settings
            </Flex>
            {iosStatus.length > 0 && !!iosStatus?.find((r) => !r.isValid) ? <AiFillExclamationCircle style={{ color: '#ff7369' }} /> : <div></div>}
          </SiderButton>
        ) : null}
        <SiderButton link="/home/trouble-shooting">
          <MdTroubleshoot />
          &nbsp;&nbsp;Troubleshoot
        </SiderButton>
      </div>

      <div>
        <Footer />
      </div>
    </Sider>
  );
};

export default HomeMenuSider;

const Sider = styled.aside<{ mode: ColorMode }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 250px;
  background-color: var(--chakra-colors-gray-${(props) => (props.mode === 'light' ? 200 : 900)});
  flex-shrink: 0;

  @media screen and (max-width: 767px) {
    width: 200px;
  }
`;
