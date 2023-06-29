import { Stack } from '@chakra-ui/react';
import { IoMdHelpCircle } from 'react-icons/io';
import { Outlet } from 'react-router-dom';

import { ipc } from '../../utils/window';
import DevButton from '../DevButton';
import BasicLayout from './BasicLayout';
import Header from './Header';
import HeaderIconMenuButon from './HeaderIconMenuButon';

const SetupLayout = () => {
  const openDocs = async () => {
    await ipc.settingsClient.openExternal('https://docs.dogutech.io');
  };

  return (
    <BasicLayout
      header={
        <Header
          right={
            <Stack direction="row" spacing="8px" alignItems={'center'}>
              <HeaderIconMenuButon icon={<IoMdHelpCircle style={{ fontSize: '18px' }} />} onClick={openDocs} />
              <DevButton />
            </Stack>
          }
        />
      }
    >
      <Outlet />
    </BasicLayout>
  );
};

export default SetupLayout;
