import { Tag } from '@chakra-ui/react';
import { HostAgentConnectionStatus } from '../../shares/child';

interface Props {
  status: HostAgentConnectionStatus;
}

const HostAgentConnectionStatusBadge = ({ status }: Props) => {
  switch (status.status) {
    case 'is-not-active':
      return (
        <Tag colorScheme="gray" fontWeight="semibold">
          Need to set
        </Tag>
      );
    case 'disconnected':
      return (
        <Tag colorScheme="red" fontWeight="semibold">
          Disconnected
        </Tag>
      );
    case 'connecting':
      return (
        <Tag colorScheme="yellow" fontWeight="semibold">
          Connecting
        </Tag>
      );
    case 'connected':
      return (
        <Tag colorScheme="green" fontWeight="semibold">
          Connected
        </Tag>
      );
    default:
      return null;
  }
};

export default HostAgentConnectionStatusBadge;
