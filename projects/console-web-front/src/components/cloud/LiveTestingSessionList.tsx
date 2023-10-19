import { LiveSessionState, Platform } from '@dogu-private/types';
import { LiveSessionBase } from '@dogu-private/console';
import styled from 'styled-components';
import { List, Button, Space } from 'antd';
import Link from 'next/link';
import { shallow } from 'zustand/shallow';
import { CheckCircleTwoTone, WarningTwoTone } from '@ant-design/icons';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { deviceBrandMapper } from '../../resources/device/brand';
import PlatformIcon from '../device/PlatformIcon';
import { sendSuccessNotification } from '../../utils/antd';
import LiveTestingCloseSessionButton from './LiveTestingCloseSessionButton';
import useEventStore from '../../stores/events';
import CountUpTimer from '../common/CountUpTimer';
import CountDownTimer from '../common/CountDownTimer';

const SessionState: React.FC<{ session: LiveSessionBase }> = ({ session }) => {
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);
  const { t } = useTranslation('cloud-device');

  if (session.state === LiveSessionState.CLOSED) {
    return <div>{t('liveSessionClosedStatusText')}</div>;
  }

  if (session.state === LiveSessionState.CREATED) {
    return (
      <div>
        <CheckCircleTwoTone twoToneColor="#52c41a" />
        &nbsp;{t('liveSessionInProgressStatusText')}: <CountUpTimer startedAt={new Date(session.createdAt)} />
      </div>
    );
  }

  return (
    <div>
      <WarningTwoTone twoToneColor="#e99957" />
      &nbsp;
      <Trans
        i18nKey="cloud-device:liveSessionCloseWaitStatusText"
        components={{
          timer: (
            <CountDownTimer
              startedAt={session.closeWaitAt ? new Date(session.closeWaitAt) : new Date()}
              endMs={3 * 60 * 1000}
              onEnd={() => fireEvent('onRefreshClicked')}
            />
          ),
        }}
      />
    </div>
  );
};

interface ItemProps {
  session: LiveSessionBase;
}

const SessionItem: React.FC<ItemProps> = ({ session }) => {
  const { t } = useTranslation('cloud-device');
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
          <Space.Compact>
            <Link
              href={`/dashboard/${session.organizationId}/live-testing/${session.liveSessionId}/${session.deviceId}`}
              target="_blank"
            >
              <Button type="primary">{t('liveSessionEnterButtonText')}</Button>
            </Link>
            <LiveTestingCloseSessionButton
              sessionId={session.liveSessionId}
              organizationId={session.organizationId}
              onClose={() => sendSuccessNotification('Session closed!')}
            >
              {t('liveSessionCloseButtonText')}
            </LiveTestingCloseSessionButton>
          </Space.Compact>
        </ButtonWrapper>
      </ItemInner>
    </Item>
  );
};

interface Props {
  data: LiveSessionBase[];
}

const LiveTestingSessionList: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation('cloud-device');

  return (
    <>
      <Header>
        <ItemInner>
          <OneSpan>{t('liveSessionListBrandColumn')}</OneSpan>
          <OneSpan>{t('liveSessionListNameColumn')}</OneSpan>
          <OneSpan>{t('liveSessionListPlatformAndVersionColumn')}</OneSpan>
          <OneSpan>{t('liveSessionListStatusColumn')}</OneSpan>
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
  width: 180px;
  display: flex;
  justify-content: flex-end;
`;
