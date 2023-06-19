import { DeviceBase } from '@dogu-private/console';
import { Tag } from 'antd';
import React from 'react';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { listActiveNameStyle } from '../../styles/text';
import DevicePrefixTag from './DevicePrefixTag';

interface Props {
  device: DeviceBase;
  onClick: () => void;
}

const DeviceName = ({ device, onClick }: Props) => {
  return (
    <Box onClick={onClick}>
      <DevicePrefixTag device={device} />
      <StyledName>{device.name}</StyledName>
    </Box>
  );
};

export default React.memo(DeviceName);

const StyledName = styled.p`
  ${listActiveNameStyle}
  text-align: left;
`;

const Box = styled.button`
  ${flexRowBaseStyle}
  padding: 4px;
  margin-left: -4px;
  background-color: #fff;

  &:hover ${StyledName} {
    text-decoration: underline;
  }
`;

const StyledTag = styled(DevicePrefixTag)`
  margin-right: 0.25rem;

  &:hover {
    text-decoration: none !important;
  }
`;
