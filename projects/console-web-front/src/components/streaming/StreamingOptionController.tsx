import { Dropdown, InputNumber, MenuProps, Slider } from 'antd';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { CaretDownOutlined, WarningOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';

import useStreamingOptionStore from 'src/stores/streaming-option';
import useTranslation from 'next-translate/useTranslation';

const StreamingOptionController = () => {
  const { option, updateOption } = useStreamingOptionStore();
  const { t } = useTranslation();

  const fpsItems: MenuProps['items'] = [
    {
      label: <p onClick={() => updateOption({ fps: 30 })}>30</p>,
      key: 'fps-30',
    },
    {
      label: <p onClick={() => updateOption({ fps: 60 })}>60</p>,
      key: 'fps-60',
    },
  ];

  const resolutionItems: MenuProps['items'] = [
    {
      label: <p onClick={() => updateOption({ resolution: 1080 })}>1080p</p>,
      key: 'resolution-1080',
    },
    {
      label: <p onClick={() => updateOption({ resolution: 720 })}>720p</p>,
      key: 'resolution-720',
    },
    {
      label: <p onClick={() => updateOption({ resolution: 360 })}>360p</p>,
      key: 'resolution-360',
    },
  ];

  return (
    <Box>
      <Content>
        <ContentTitle>{t('device-streaming:maxFPS')}</ContentTitle>
        <Dropdown menu={{ items: fpsItems }} trigger={['click']}>
          <ResolutionButton>
            {option.fps ?? 30}&nbsp;&nbsp;
            <CaretDownOutlined />
          </ResolutionButton>
        </Dropdown>
      </Content>
      <Content>
        <ContentTitle>{t('device-streaming:resolution')}</ContentTitle>
        <Dropdown menu={{ items: resolutionItems }} trigger={['click']}>
          <ResolutionButton>
            {option.resolution ?? 720}p&nbsp;&nbsp;
            <CaretDownOutlined />
          </ResolutionButton>
        </Dropdown>
      </Content>
      <Content>
        <ContentTitle>{t('device-streaming:scrollSensitivity')}</ContentTitle>
        <Slider
          min={1}
          max={100}
          onChange={(value) => updateOption({ scrollSensitivity: value })}
          value={option.scrollSensitivity ?? 25}
        />
      </Content>
    </Box>
  );
};

export default React.memo(StreamingOptionController);

const Box = styled.div``;

const Content = styled.div`
  margin-bottom: 1rem;
  width: 100%;
`;

const ContentTitle = styled.p`
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ResolutionButton = styled.button`
  display: flex;
  align-items: center;
  background-color: #fff;
  color: #000;
  padding: 0.5rem 1rem;
  border: 1px solid ${(props) => props.theme.colors.gray3};
  border-radius: 8px;
`;
