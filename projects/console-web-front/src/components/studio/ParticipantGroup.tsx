import { UserBase } from '@dogu-private/console';
import { DeviceId, OrganizationId, WS_PING_MESSAGE } from '@dogu-private/types';
import { Avatar, Tooltip } from 'antd';
import { useState, useEffect } from 'react';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';

import useWebSocket from '../../hooks/useWebSocket';
import useEventStore from '../../stores/events';
import { theme } from '../../styles/theme';
import ProfileImage from '../ProfileImage';

interface Props {
  organizationId: OrganizationId;
  deviceId: DeviceId;
  userId: UserBase['userId'];
}

const ParticipantGroup: React.FC<Props> = ({ organizationId, deviceId, userId }) => {
  const { peerConnection } = useDeviceStreamingContext();
  const socketRef = useWebSocket(`/ws/device-streaming-session?organizationId=${organizationId}&deviceId=${deviceId}`);
  const [users, setUsers] = useState<UserBase[]>([]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.onmessage = (event) => {
        if (event.data === WS_PING_MESSAGE) {
          return;
        }

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

  useEffect(() => {
    const unsub = useEventStore.subscribe(({ eventName, payload }) => {
      if (eventName === 'onStreamingClosed') {
        console.log('here');
        if (deviceId === payload) {
          socketRef.current?.close();
          setUsers([]);
        }
      }
    });

    return () => {
      unsub();
    };
  }, [deviceId]);

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
