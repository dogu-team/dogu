import { CheckCircleIcon } from '@chakra-ui/icons';
import { Badge } from '@chakra-ui/react';
import { AiFillExclamationCircle } from 'react-icons/ai';

import { HostAgentConnectionStatus } from '../../shares/child';

interface Props {
  status: HostAgentConnectionStatus;
}

const HostAgentConnectionStatusIcon = ({ status }: Props) => {
  if (status.status === 'connected') {
    return <CheckCircleIcon style={{ color: '#6bcc64' }} />;
  }

  return <AiFillExclamationCircle style={{ color: '#ff7369' }} />;
};

export default HostAgentConnectionStatusIcon;
