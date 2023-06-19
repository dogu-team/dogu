import { Outlet } from 'react-router-dom';
import DevButton from '../DevButton';

import BasicLayout from './BasicLayout';
import Header from './Header';

const SetupLayout = () => {
  return (
    <BasicLayout header={<Header right={<DevButton />} />}>
      <Outlet />
    </BasicLayout>
  );
};

export default SetupLayout;
