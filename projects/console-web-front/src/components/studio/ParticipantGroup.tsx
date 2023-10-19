import { UserBase } from '@dogu-private/console';
import { DeviceId, OrganizationId } from '@dogu-private/types';
import { Avatar, Tooltip } from 'antd';
import { useState, useEffect } from 'react';

import useWebSocket from '../../hooks/useWebSocket';
import { theme } from '../../styles/theme';
import ProfileImage from '../ProfileImage';

interface Props {
  organizationId: OrganizationId;
  deviceId: DeviceId;
  userId: UserBase['userId'];
}

const ParticipantGroup: React.FC<Props> = ({ organizationId, deviceId, userId }) => {
  const socketRef = useWebSocket(`/ws/device-streaming-session?organizationId=${organizationId}&deviceId=${deviceId}`);
  const [users, setUsers] = useState<UserBase[]>([]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.onmessage = (event) => {
        const data: { users: UserBase[] } = JSON.parse(event.data);
        setUsers(data.users);
      };
    }

    return () => {
      if (socketRef.current) {
        socketRef.current?.close();
      }
    };
  }, [socketRef]);

  return (
    <Avatar.Group>
      {users.map((user) => (
        <Tooltip key={user.userId} title={user.name}>
          <ProfileImage
            name={user.name}
            profileImageUrl={user.profileImageUrl}
            size={32}
            style={{
              border: userId === user.userId ? `2px solid ${theme.colorPrimary}` : undefined,
            }}
          />
        </Tooltip>
      ))}
    </Avatar.Group>
  );
};

export default ParticipantGroup;
