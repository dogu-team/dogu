import { Stack, Tooltip, useDisclosure } from '@chakra-ui/react';
import { AiFillFileZip } from 'react-icons/ai';
import { IoMdHelpCircle } from 'react-icons/io';
import { Outlet } from 'react-router-dom';

import { ipc } from '../../utils/window';
import DevButton from '../DevButton';
import { ReportLogAlert } from '../overlays/ReportLogAlert';
import BasicLayout from './BasicLayout';
import Header from './Header';
import HeaderIconMenuButon from './HeaderIconMenuButon';

const SetupLayout = () => {
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();

  const openDocs = async () => {
    await ipc.settingsClient.openExternal('https://docs.dogutech.io');
  };

  return (
    <>
      <BasicLayout
        header={
          <Header
            right={
              <Stack direction="row" spacing="8px" alignItems={'center'}>
                <HeaderIconMenuButon icon={<IoMdHelpCircle style={{ fontSize: '18px' }} />} onClick={openDocs} />

                <Tooltip label="Create Report Zip" placement="bottom" shouldWrapChildren>
                  <HeaderIconMenuButon icon={<AiFillFileZip style={{ fontSize: '18px' }} />} onClick={onReportOpen} />
                </Tooltip>

                <DevButton />
              </Stack>
            }
          />
        }
      >
        <Outlet />
      </BasicLayout>
      <ReportLogAlert isOpen={isReportOpen} onClose={onReportClose} />
    </>
  );
};

export default SetupLayout;
