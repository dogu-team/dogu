import { DeviceBase } from '@dogu-private/console';
import { Tag } from 'antd';
import React from 'react';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { listActiveNameStyle } from '../../styles/text';
import RunnerPrefixTag from './RunnerPrefixTag';

interface Props {
  device: DeviceBase;
  onClick: () => void;
}

const RunnerName = ({ device, onClick }: Props) => {
  return (
    <Box onClick={onClick}>
      <RunnerPrefixTag device={device} />
      <StyledName>{device.name}</StyledName>
    </Box>
  );
};

export default React.memo(RunnerName);

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

const StyledTag = styled(RunnerPrefixTag)`
  margin-right: 0.25rem;

  &:hover {
    text-decoration: none !important;
  }
`;
