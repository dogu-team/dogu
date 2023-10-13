import { LiveSessionState, Platform } from '@dogu-private/types';
import { LiveSessionBase } from '@dogu-private/console';
import styled from 'styled-components';
import { List, Button } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { deviceBrandMapper } from '../../resources/device/brand';
import PlatformIcon from '../device/PlatformIcon';
import { sendSuccessNotification } from '../../utils/antd';
import LiveTestingCloseSessionButton from './LiveTestingCloseSessionButton';

const SessionState: React.FC<{ state: LiveSessionState; closeWaitAt: Date | null }> = ({ state, closeWaitAt }) => {
  if (state === LiveSessionState.CREATED) {
    return <div>Ongoing</div>;
  }

  return <div>{state}</div>;
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
          <SessionState state={session.state} closeWaitAt={session.closeWaitAt} />
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
