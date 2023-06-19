import { RoutineDeviceJobBase } from '@dogu-private/console';
import React, { useState } from 'react';

interface Props {
  deviceJob: RoutineDeviceJobBase;
  children: React.ReactNode;
}

const DeviceJobResultContent = ({ deviceJob, children }: Props) => {
  const [] = useState(false);
};

export default DeviceJobResultContent;
