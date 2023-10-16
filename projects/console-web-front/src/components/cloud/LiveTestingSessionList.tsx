import { LiveSessionState, Platform } from '@dogu-private/types';
import { LiveSessionBase } from '@dogu-private/console';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { List, Button } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { shallow } from 'zustand/shallow';
import { CheckCircleTwoTone, WarningTwoTone } from '@ant-design/icons';

import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { deviceBrandMapper } from '../../resources/device/brand';
import PlatformIcon from '../device/PlatformIcon';
import { sendSuccessNotification } from '../../utils/antd';
import LiveTestingCloseSessionButton from './LiveTestingCloseSessionButton';
import { stringifyDurationAsTimer } from '../../utils/date';
import useEventStore from '../../stores/events';

const SessionState: React.FC<{ session: LiveSessionBase }> = ({ session }) => {
  const countDuration = useCallback(() => {
    const now = new Date();
    if (session.state === LiveSessionState.CREATED) {
      return now.getTime() - new Date(session.createdAt).getTime();
    }

    if (session.closeWaitAt) {
      const closeWaitAt = new Date(session.closeWaitAt).getTime();
      const THREE_MIN = 3 * 60 * 1000;
      return THREE_MIN - (now.getTime() - closeWaitAt);
    }

    return 0;
  }, [session.state, session.createdAt, session.closeWaitAt]);
  const [duration, setDuration] = useState<number>(() => {
    return countDuration();
  });
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(countDuration());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [countDuration]);

  useEffect(() => {
    if (duration <= 0) {
      setDuration(0);
      fireEvent('onRefreshClicked');
    }
  }, [duration]);

  if (session.state === LiveSessionState.CLOSED) {
    return <div>Closed</div>;
  }

  if (session.state === LiveSessionState.CREATED) {
    return (
      <div>
        <CheckCircleTwoTone twoToneColor="#52c41a" />
        &nbsp;Started {stringifyDurationAsTimer(duration)}
      </div>
    );
  }

  return (
    <div>
      <WarningTwoTone twoToneColor="#e99957" />
      &nbsp;Close after {stringifyDurationAsTimer(duration)}
    </div>
  );
};

interface ItemProps {
  session: LiveSessionBase;
}

const SessionItem: React.FC<ItemProps> = ({ session }) => {
  const brand = session.device?.manufacturer
    ? deviceBrandMapper[session.device.manufacturer] ?? session.device.manufacturer
    : null;

  return (
    <Item>
      <ItemInner>
        <OneSpan>{brand}</OneSpan>
        <OneSpan>{session.device?.modelName ?? session.device?.model}</OneSpan>
        <OneSpan style={{ display: 'flex', alignItems: 'center' }}>
          <PlatformIcon platform={session.device?.platform || Platform.UNRECOGNIZED} />
          &nbsp;
          {session.device?.version}
        </OneSpan>
        <OneSpan>
          <SessionState session={session} />
        </OneSpan>
        <ButtonWrapper>
          <Link
            href={`/dashboard/${session.organizationId}/live-testing/${session.liveSessionId}/${session.deviceId}`}
            target="_blank"
          >
            <Button type="primary">Enter</Button>
          </Link>
          <LiveTestingCloseSessionButton
            sessionId={session.liveSessionId}
            organizationId={session.organizationId}
            onClose={() => sendSuccessNotification('Session closed!')}
          >
            Close
          </LiveTestingCloseSessionButton>
        </ButtonWrapper>
      </ItemInner>
    </Item>
  );
};

interface Props {
  data: LiveSessionBase[];
}

const LiveTestingSessionList: React.FC<Props> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <Header>
        <ItemInner>
          <OneSpan>Brand</OneSpan>
          <OneSpan>Name</OneSpan>
          <OneSpan>Platform & Version</OneSpan>
          <OneSpan>Status</OneSpan>
          <ButtonWrapper />
        </ItemInner>
      </Header>
      <List<LiveSessionBase>
        dataSource={data}
        renderItem={(session) => <SessionItem session={session} />}
        rowKey={(session) => session.liveSessionId}
      />
    </>
  );
};

export default LiveTestingSessionList;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const ItemInner = styled.div`
  ${flexRowBaseStyle}
`;

const OneSpan = styled.div`
  ${tableCellStyle}
  flex: 1;
`;

const ButtonWrapper = styled.div`
  width: 160px;
  display: flex;
  justify-content: flex-end;
`;
