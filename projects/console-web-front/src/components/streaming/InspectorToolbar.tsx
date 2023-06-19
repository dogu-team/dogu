import { CaretRightOutlined, DisconnectOutlined, PauseOutlined, ReloadOutlined, SelectOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { flexRowBaseStyle, flexRowCenteredStyle } from '../../styles/box';

interface Props {
  onRefresh: () => void | Promise<void>;
  onReset: () => void | Promise<void>;
}

const InspectorToolbar = ({ onRefresh, onReset }: Props) => {
  const { mode, updateMode } = useDeviceStreamingContext();
  const [refreshTime, setRefreshTime] = useState(moment().format('LTS'));
  const [refreshEnabled, setRefreshEnabled] = useState(true);
  const { t } = useTranslation();

  const handleRefresh = useCallback(() => {
    onRefresh();
    setRefreshTime(moment().format('LTS'));
  }, [onRefresh]);

  useEffect(() => {
    if (refreshEnabled) {
      handleRefresh();
      const timer = setInterval(() => {
        handleRefresh();
      }, 3000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [handleRefresh, refreshEnabled]);

  return (
    <Box>
      <p>
        {t('device-streaming:inspectorRefreshedAtText')}: {refreshTime}
      </p>

      <ButtonWrapper>
        <Tooltip title="Reset">
          <StyledButton onClick={onReset}>
            <DisconnectOutlined style={{ fontSize: '.75rem' }} />
          </StyledButton>
        </Tooltip>
        <StyledButton onClick={() => setRefreshEnabled((prev) => !prev)}>
          {refreshEnabled ? <PauseOutlined style={{ fontSize: '.75rem' }} /> : <CaretRightOutlined style={{ fontSize: '.75rem' }} />}
        </StyledButton>
        <StyledButton onClick={handleRefresh}>
          <ReloadOutlined style={{ fontSize: '.75rem' }} />
        </StyledButton>
        <StyledButton
          style={{ backgroundColor: mode === 'inspect' ? 'skyblue' : '#ffffff' }}
          onClick={() => {
            updateMode(mode === 'input' ? 'inspect' : 'input');
          }}
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
  border-bottom: 1px solid ${(props) => props.theme.main.colors.gray5};
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
`;
