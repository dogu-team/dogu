import { CaretRightFilled, DeleteOutlined, PauseOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { Log } from '@dogu-tech/common';
import { Button, Input, Tooltip } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import DeviceLogItem from '../logs/DeviceLogItem';
import VirtualizeLogContainer from '../logs/VirtualizeLogContainer';

interface Props {
  filterValue: string;
  deviceLogs: Log[];
  isStopped: boolean;
  onChangeFilterValue: (value: string) => void;
  onTogglePlay: () => void;
  clearLog: () => void;
}

const DeviceStreamingLogContainer = ({ filterValue, deviceLogs, isStopped, onTogglePlay, onChangeFilterValue, clearLog }: Props) => {
  const [value, setValue] = useState(filterValue);
  const { t } = useTranslation();

  const extractKey = useCallback((item: Log, index: number) => `${item.localTimeStamp} ${item.message} ${index}`, []);

  const renderItem = useCallback((item: Log, index: number) => {
    return <DeviceLogItem lineNumber={index + 1} log={item} />;
  }, []);

  return (
    <Box>
      <MenuBox>
        <div style={{ marginRight: '.5rem', flex: 1 }}>
          <MenuTitle>
            {t('device-streaming:deviceLogFilterMenuTitle')}{' '}
            <Tooltip title={t('device-streaming:deviceLogFilterMenuHelp')}>
              <QuestionCircleFilled />
            </Tooltip>
          </MenuTitle>
          <Input.Search
            placeholder={t('device-streaming:deviceLogFilterInputPlaceholder')}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            enterButton={
              <Button type="primary" disabled={filterValue ? value === filterValue : false}>
                {t('device-streaming:deviceLogFilterSetButtonText')}
              </Button>
            }
            onSearch={onChangeFilterValue}
            maxLength={100}
          />
        </div>

        <ButtonWrapper>
          <Button icon={isStopped ? <CaretRightFilled /> : <PauseOutlined />} onClick={onTogglePlay} size="small" />
          <Button icon={<DeleteOutlined />} onClick={clearLog} size="small" />
        </ButtonWrapper>
      </MenuBox>
      <VirtualizeLogContainer<Log> keyExtractor={extractKey} items={deviceLogs} renderItem={renderItem} itemsPerBundle={50} maxHeight={500} scrollEndOnUpdate />
    </Box>
  );
};

export default React.memo(DeviceStreamingLogContainer);

const Box = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

const MenuBox = styled.div`
  width: 100%;
  ${flexRowBaseStyle}
  background-color: #fff;
  padding: 0 1rem 1rem 1rem;
  align-items: flex-end;
`;

const MenuTitle = styled.p`
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.4rem;
`;

const ButtonWrapper = styled.div`
  ${flexRowBaseStyle}

  button {
    margin-right: 0.25rem;
  }

  button:last-child {
    margin-right: 0;
  }
`;
