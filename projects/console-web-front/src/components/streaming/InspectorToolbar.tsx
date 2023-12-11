import {
  CaretRightOutlined,
  DisconnectOutlined,
  PauseOutlined,
  ReloadOutlined,
  SelectOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { flexRowBaseStyle, flexRowCenteredStyle } from '../../styles/box';
import { InspectorType } from '../../types/streaming';

interface Props {
  onRefresh: () => void | Promise<void>;
  onReset: () => void | Promise<void>;
  selectDisabled?: boolean;
}

const InspectorToolbar = ({ onRefresh, onReset, selectDisabled }: Props) => {
  const { mode, updateMode, inspectorType } = useDeviceStreamingContext();
  const [refreshTime, setRefreshTime] = useState(moment().format('LTS'));
  const [refreshEnabled, setRefreshEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const timer = useRef<NodeJS.Timer>();
  const { t } = useTranslation();

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await onRefresh();
    setRefreshTime(moment().format('LTS'));
    setLoading(false);
  }, [onRefresh]);

  const handleReset = useCallback(async () => {
    setLoading(true);
    await onReset();
    setRefreshTime(moment().format('LTS'));
    setLoading(false);
  }, [onReset]);

  const refreshAndClearTimer = useCallback(async () => {
    await handleRefresh();
    if (inspectorType === InspectorType.GAME) {
      return;
    }
    clearInterval(timer.current);
    const t = setInterval(() => {
      handleRefresh();
    }, 5000);
    timer.current = t;
  }, [handleRefresh, inspectorType]);

  useEffect(() => {
    if (refreshEnabled) {
      handleRefresh();
      if (inspectorType === InspectorType.GAME) {
        return;
      }
      const t = setInterval(() => {
        handleRefresh();
      }, 5000);
      timer.current = t;
    }

    return () => {
      clearInterval(timer.current);
    };
  }, [handleRefresh, refreshEnabled, inspectorType]);

  useEffect(() => {
    if (mode === 'inspect' && inspectorType === InspectorType.APP) {
      refreshAndClearTimer();
    }
  }, [mode, refreshAndClearTimer, inspectorType]);

  return (
    <Box>
      <p>
        {t('device-streaming:inspectorRefreshedAtText')}: {refreshTime}
      </p>

      <ButtonWrapper>
        {inspectorType === InspectorType.GAME && (
          <Tooltip title="Reconnect">
            <StyledButton onClick={handleReset} disabled={loading}>
              <DisconnectOutlined style={{ fontSize: '.75rem' }} />
            </StyledButton>
          </Tooltip>
        )}
        <StyledButton onClick={() => setRefreshEnabled((prev) => !prev)}>
          {refreshEnabled ? (
            <PauseOutlined style={{ fontSize: '.75rem' }} />
          ) : (
            <CaretRightOutlined style={{ fontSize: '.75rem' }} />
          )}
        </StyledButton>
        <StyledButton onClick={refreshAndClearTimer} disabled={loading}>
          <ReloadOutlined style={{ fontSize: '.75rem' }} spin={loading} />
        </StyledButton>
        <StyledButton
          style={{ backgroundColor: mode === 'inspect' ? 'skyblue' : '#ffffff' }}
          onClick={() => {
            updateMode(mode === 'input' ? 'inspect' : 'input');
          }}
          disabled={selectDisabled}
        >
          <SelectOutlined style={{ fontSize: '.75rem', color: mode === 'inspect' ? '#fff' : 'black' }} />
        </StyledButton>
      </ButtonWrapper>
    </Box>
  );
};

export default InspectorToolbar;

const Box = styled.div`
  ${flexRowBaseStyle}
  height: 28px;
  font-size: 0.8rem;
  border-bottom: 1px solid ${(props) => props.theme.main.colors.gray6};
`;

const ButtonWrapper = styled.div`
  ${flexRowBaseStyle}
  margin-left: .5rem;
`;

const StyledButton = styled.button`
  ${flexRowCenteredStyle}
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${(props) => props.theme.main.colors.white};
  border: 1px solid ${(props) => props.theme.main.colors.gray5};
  margin-right: 0.25rem;

  &:disabled {
    opacity: 0.5;
    background-color: ${(props) => props.theme.main.colors.gray6};
  }
`;
