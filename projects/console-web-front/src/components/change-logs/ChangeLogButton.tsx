import { TfiAnnouncement } from 'react-icons/tfi';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Drawer, Empty } from 'antd';
import useSWR from 'swr';
import { LoadingOutlined } from '@ant-design/icons';
import { ChangeLogBase } from '@dogu-private/console';
import { shallow } from 'zustand/shallow';

import { swrAuthFetcher } from '../../api/index';
import { flexRowCenteredStyle } from '../../styles/box';
import ChangeLogCard from './ChangeLogCard';
import { updateLastSeen } from '../../api/change-log';
import useRefresh from '../../hooks/useRefresh';
import useAuthStore from '../../stores/auth';

interface Props {}

const ChangeLogButton = ({}: Props) => {
  const [me, updateMe] = useAuthStore((state) => [state.me, state.updateMe], shallow);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewLogs, setHasNewLogs] = useState(false);
  const { data, isLoading, error, mutate } = useSWR<ChangeLogBase[]>(`/change-logs`, swrAuthFetcher, {
    revalidateOnFocus: false,
  });

  useRefresh(['onChangeLogReactionUpdated'], () => mutate());

  useEffect(() => {
    if (data) {
      if (data.length === 0) {
        return;
      }

      if (!me?.lastChangeLogSeenAt) {
        setHasNewLogs(true);
        return;
      }

      if (new Date(data[0].createdAt).getTime() > new Date(me.lastChangeLogSeenAt).getTime()) {
        setHasNewLogs(true);
      }
    }
  }, [data, me]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewLogs(false);
    if (me) {
      updateMe({ ...me, lastChangeLogSeenAt: new Date() });
    }
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
        {!!data && data.length > 0 ? (
          data.map((changeLog) => {
            return <ChangeLogCard key={changeLog.changeLogId} changeLog={changeLog} />;
          })
        ) : (
          <Centered>
            <Empty description="No announcements" />
          </Centered>
        )}
      </StyledDrawer>
    </>
  );
};

export default ChangeLogButton;

const StyledButton = styled.button`
  position: relative;
  ${flexRowCenteredStyle}
  width: 2rem;
  height: 2rem;
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

const Centered = styled.div`
  ${flexRowCenteredStyle}
  height: 100%;
`;
