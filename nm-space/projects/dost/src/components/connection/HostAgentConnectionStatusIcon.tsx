import { CheckCircleIcon } from '@chakra-ui/icons';
import { Badge, Spinner } from '@chakra-ui/react';
import { AiFillExclamationCircle, AiOutlineLoading, AiOutlineStop } from 'react-icons/ai';

import { HostAgentConnectionStatus } from '../../shares/child';

interface Props {
  status: HostAgentConnectionStatus;
}

const HostAgentConnectionStatusIcon = ({ status }: Props) => {
  if (status.status === 'connected') {
    return <CheckCircleIcon style={{ color: '#6bcc64' }} />;
  }

  if (status.status === 'connecting') {
    return <Spinner size='sm' />
  }

  if (status.status === 'disconnected') {
    return <AiFillExclamationCircle style={{ color: '#ff7369' }} />;
  }
  
  return <AiOutlineStop />
};

export default HostAgentConnectionStatusIcon;
