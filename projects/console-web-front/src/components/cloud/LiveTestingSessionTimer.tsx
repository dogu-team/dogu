import { CloseOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { LiveSessionBase, CloudLicenseLiveTestingEvent } from '@dogu-private/console';
import { LiveSessionId, OrganizationId } from '@dogu-private/types';
import { Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useEventStore from '../../stores/events';
import { stringifyDurationAsTimer } from '../../utils/date';

interface Props {
  organizationId: OrganizationId;
  sessionId: LiveSessionId;
}

const LiveTestingSessionTimer: React.FC<Props> = ({ organizationId, sessionId }) => {
  const { data } = useSWR<LiveSessionBase>(
    `/organizations/${organizationId}/live-sessions/${sessionId}`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );
  const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);
  const [sessionTimeInfo, setSessionTimeInfo] = useState<{
    duration: number;
    remainingFreeSeconds: number;
  }>({
    duration: 0,
    remainingFreeSeconds: 0,
  });
  const isUserCloseTooltip = useRef<boolean>(false);
  const timer = useRef<NodeJS.Timer>();

  useEffect(() => {
    if (!data) {
      return;
    }

    setSessionTimeInfo((prev) => ({ ...prev, duration: new Date().getTime() - new Date(data.createdAt).getTime() }));
    const ct = setInterval(() => {
      setSessionTimeInfo((prev) => {
        if (prev.remainingFreeSeconds > 0) {
          return {
            duration: new Date().getTime() - new Date(data.createdAt).getTime(),
            remainingFreeSeconds: prev.remainingFreeSeconds - 1,
          };
        }
        return { ...prev, duration: new Date().getTime() - new Date(data.createdAt).getTime() };
      });
    }, 1000);
    timer.current = ct;

    return () => {
      clearInterval(ct);
    };
  }, [data]);

  useEffect(() => {
    useEventStore.subscribe(({ eventName, payload }) => {
      if (eventName === 'onCloudRemainingFreeSecondMessage') {
        const message = payload as CloudLicenseLiveTestingEvent;
        if (message.remainingFreeSeconds < 5 * 60) {
          setSessionTimeInfo((prev) => ({ ...prev, remainingFreeSeconds: message.remainingFreeSeconds }));
          if (!isUserCloseTooltip.current) {
            setIsTooltipOpen(true);
          }
        }
      } else if (eventName === 'onStreamingClosed') {
        setIsTooltipOpen(false);
        clearInterval(timer.current);
      }
    });
  }, []);

  if (!data) {
    return null;
  }

  return (
    <Tooltip
      open={isTooltipOpen}
      color="#e99957"
      placement="bottom"
      title={
        <>
          Your free trial will be end in <b>{stringifyDurationAsTimer(sessionTimeInfo.remainingFreeSeconds * 1000)}</b>
          <CloseButton
            onClick={() => {
              setIsTooltipOpen(false);
              isUserCloseTooltip.current = true;
            }}
          >
            Close
          </CloseButton>
        </>
      }
    >
      <Box>
        <FieldTimeOutlined style={{ marginRight: '.25rem' }} />
        {stringifyDurationAsTimer(sessionTimeInfo.duration)}
      </Box>
    </Tooltip>
  );
};

export default LiveTestingSessionTimer;

const Box = styled.div`
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  border: 1px solid ${(props) => props.theme.main.colors.blue5};
  font-size: 0.9rem;
  user-select: none;
`;

const CloseButton = styled.button`
  display: block;
  background-color: transparent;
  border: none;
  padding: 0.2rem;
  padding-left: 0;
  text-decoration: underline;
`;
