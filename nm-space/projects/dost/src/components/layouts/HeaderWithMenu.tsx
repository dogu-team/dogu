import { ColorMode, Stack, useDisclosure, Tooltip } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AiFillSetting, AiFillFileZip } from 'react-icons/ai';
import { IoMdHelpCircle } from 'react-icons/io';

import { ipc } from '../../utils/window';
import DevButton from '../DevButton';
import Header from './Header';
import HeaderIconMenuButon from './HeaderIconMenuButon';
import { ReportLogAlert } from '../overlays/ReportLogAlert';
import DeviceSharedAlert from '../DeviceSharedAlert';

const HeaderWithMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();

  const openDocs = async () => {
    await ipc.settingsClient.openExternal('https://docs.dogutech.io');
  };

  return (
    <>
      <Header
        right={
          <Stack direction="row" spacing="8px" alignItems={'center'}>
            <HeaderIconMenuButon icon={<IoMdHelpCircle style={{ fontSize: '18px' }} />} onClick={openDocs} />

            <Tooltip label="Create Report Zip" placement="bottom" shouldWrapChildren>
              <HeaderIconMenuButon icon={<AiFillFileZip style={{ fontSize: '18px' }} />} onClick={onReportOpen} />
            </Tooltip>

            <HeaderIconMenuButon icon={<AiFillSetting style={{ fontSize: '18px' }} />} onClick={() => navigate('/settings')} selected={location.pathname === '/settings'} />
            <DevButton />
          </Stack>
        }
      />
      <ReportLogAlert isOpen={isReportOpen} onClose={onReportClose} />
    </>
  );
};

const HeaderButton = styled.button<{ mode: ColorMode; selected?: boolean }>`
  display: flex;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.selected ? `var(--chakra-colors-gray-${props.mode === 'light' ? 100 : 700})` : 'transparent')};

  &:hover {
    background-color: var(--chakra-colors-gray-${(props) => (props.mode === 'light' ? 100 : 700)});
  }
`;

export default HeaderWithMenu;
