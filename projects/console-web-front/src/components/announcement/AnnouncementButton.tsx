import { TfiAnnouncement } from 'react-icons/tfi';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import { flexRowCenteredStyle } from '../../styles/box';
import AnnouncementCard from './AnnouncementCard';
import { updateLastSeen } from '../../api/change-log';
import { LoadingOutlined } from '@ant-design/icons';
import { ChangeLogBase } from '@dogu-private/console';
import useRefresh from '../../hooks/useRefresh';
import useAuth from '../../hooks/useAuth';

const AnnouncementButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewLogs, setHasNewLogs] = useState(false);
  const { me } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<ChangeLogBase[]>(`/change-logs`, swrAuthFetcher, { revalidateOnFocus: false });

  useRefresh(['onChangeLogReactionUpdated'], mutate);

  useEffect(() => {
    if (data && me) {
      if (data.length === 0) {
        return;
      }

      if (!me.lastChangeLogSeenAt) {
        setHasNewLogs(true);
        return;
      }

      if (new Date(data[0].createdAt).getTime() > new Date(me.lastChangeLogSeenAt).getTime()) {
        setHasNewLogs(true);
      }
    }
  }, [data, me]);

  const handleOpen = async () => {
    setIsOpen(true);
    setHasNewLogs(false);
    if (hasNewLogs) {
      updateLastSeen().catch((e) => {});
    }
  };

  return (
    <>
      <StyledButton onClick={handleOpen} disabled={!me && !data}>
        <TfiAnnouncement />
        {hasNewLogs && <Dot />}
      </StyledButton>

      <StyledDrawer placement="right" title="What's new" onClose={() => setIsOpen(false)} open={isOpen} destroyOnClose>
        {error && <div>error</div>}
        {isLoading && (
          <div>
            loading...
            <LoadingOutlined />
          </div>
        )}
        {!!data &&
          data.map((changeLog) => {
            return <AnnouncementCard key={changeLog.changeLogId} changeLog={changeLog} />;
          })}
      </StyledDrawer>
    </>
  );
};

export default AnnouncementButton;

const StyledButton = styled.button`
  position: relative;
  ${flexRowCenteredStyle}
  width: 2rem;
  height: 2rem;
  margin-right: 0.75rem;
  border-radius: 50%;
  color: #000;
  font-size: 1.2rem;
  background-color: #fff;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding: 1rem;
    background-color: ${(props) => props.theme.colorPrimary}18;
  }
`;

const Dot = styled.div`
  position: absolute;
  top: 3px;
  right: 3px;
  background-color: #f0595b;
  width: 12px;
  height: 12px;
  border-radius: 50%;
`;
