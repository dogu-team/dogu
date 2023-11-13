import { Device } from '@dogu-private/device-data';
import React, { useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';

export interface PageImageProps {
  width: number;
  height: number;
  imageUrl: string;
  devices: Device[];
}

const PageImage = ({ width, height, imageUrl, devices }: PageImageProps) => {
  console.log(width, height, 960 * (width / height));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <DimensionHorizontalIndicator value={`${width} px`} />
      <img src={imageUrl} alt="PageImage" />
      <DeviceTitleBox>
        {devices.map((device) => {
          return (
            <DeviceTitleWrapper key={device.name}>
              <DeviceTitle>{device.name}</DeviceTitle>
            </DeviceTitleWrapper>
          );
        })}
      </DeviceTitleBox>
    </div>
  );
};

const DeviceTitleBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const DeviceTitleWrapper = styled.div`
  width: 100%;
  background-color: #a49c9c;
  padding: 0.4rem;
  border-radius: 8px; // 모서리 둥글기
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const DeviceTitle = styled.p`
  font-size: 8px;
  color: #ffffff;
  text-align: center;
`;

export default PageImage;

const DimensionHorizontalIndicator = ({ value }: { value: string }) => {
  return (
    <MeasurementBar>
      <Arrow />
      <Line />
      <Dimension>{value}</Dimension>
      <Line />
      <Arrow />
    </MeasurementBar>
  );
};

const MeasurementBar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 0.4rem;
`;

const Line = styled.div`
  height: 1px;
  background-color: #a7a7a7;
  flex-grow: 1;
`;

const Dimension = styled.div`
  padding: 0 4px;
  font-size: 7px;
  font-weight: bold;
  color: #5f5f5f;
`;

const Arrow = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 2px 0 2px 4px;
  border-color: transparent transparent transparent #a7a7a7;
  &:first-child {
    transform: rotate(180deg);
  }
`;
