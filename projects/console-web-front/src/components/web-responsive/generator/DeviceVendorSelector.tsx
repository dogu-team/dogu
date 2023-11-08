import React from 'react';
import styled from 'styled-components';

import DeviceVendorSelectorBox from './DeviceVendorSelectorBox';

const DeviceVendorSelector = () => {
  return (
    <Box>
      <DeviceVendorSelectorBox vendor={'Apple'} series={['iPhone', 'iPhone SE', 'iPad']} />
      <DeviceVendorSelectorBox
        vendor={'Samsung'}
        series={['Galaxy S', 'Galaxy A', 'Galaxy Z', 'Galaxy Tab S', 'Galaxy Tab A']}
      />
    </Box>
  );
};

export default DeviceVendorSelector;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2vw;
`;
