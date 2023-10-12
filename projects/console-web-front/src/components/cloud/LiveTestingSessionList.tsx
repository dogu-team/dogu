import { LiveSessionState, OrganizationId, Platform } from '@dogu-private/types';
import { LiveSessionBase } from '@dogu-private/console';
import useSWR from 'swr';
import styled from 'styled-components';
import { List, Button } from 'antd';
import { useRouter } from 'next/router';

import { swrAuthFetcher } from '../../api';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import useRefresh from '../../hooks/useRefresh';
import { deviceBrandMapper } from '../../resources/device/brand';
import PlatformIcon from '../device/PlatformIcon';
import Link from 'next/link';

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
          <Button danger>Close</Button>
        </ButtonWrapper>
      </ItemInner>
    </Item>
  );
};

interface Props {
  organizationId: OrganizationId;
}

const LiveTestingSessionList: React.FC<Props> = ({ organizationId }) => {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR<LiveSessionBase[]>(
    `/organizations/${organizationId}/live-sessions`,
    swrAuthFetcher,
    { keepPreviousData: true, revalidateOnFocus: false },
  );

  useRefresh(['onRefreshClicked'], () => mutate());

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
        loading={isLoading}
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
