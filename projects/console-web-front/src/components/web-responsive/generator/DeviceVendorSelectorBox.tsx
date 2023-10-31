import { Vendor } from '@dogu-private/device-data';
import { Card } from 'antd';
import { useState } from 'react';
import lodash from 'lodash';

import useResponsiveWebTestingContext from '../hook/useResponsiveWebTestingContext';
import { getVendorColor } from '../util/vendorColor';
import styled from 'styled-components';

interface Props {
  vendor: Vendor;
  series: string[];
}

const VendorTitle = (vendor: Vendor) => {
  let titleColor = getVendorColor(vendor);

  return <p style={{ fontSize: '32px', color: titleColor, textAlign: 'center', fontWeight: 'bold' }}>{vendor}</p>;
};

const DeviceVendorSelector = ({ vendor, series }: Props) => {
  const { selectedVendors, setSelectedVendors } = useResponsiveWebTestingContext();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    const deepSelectedVendors = lodash.cloneDeep(selectedVendors);

    if (clicked) {
      const index = deepSelectedVendors?.findIndex((selectedVendor) => selectedVendor === vendor);
      deepSelectedVendors?.splice(index, 1);
      setSelectedVendors(deepSelectedVendors);
    } else {
      deepSelectedVendors?.push(vendor);
      setSelectedVendors(deepSelectedVendors);
    }

    setClicked(!clicked);
  };

  return (
    <Card
      style={{
        padding: '0',
        height: '8vh',
        borderWidth: '2px',
        borderColor: clicked ? '#4776E6' : undefined,
      }}
      bodyStyle={{
        padding: '0',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
      onClick={handleClick}
      hoverable
    >
      <ContentBox>
        <TitleBox>{VendorTitle(vendor)}</TitleBox>
        <SeriesBox>
          {series.map((singleSeries) => {
            return (
              <div key={singleSeries} style={{ display: 'flex', flexDirection: 'row' }}>
                <p style={{ fontSize: '0.8rem' }}>{singleSeries}</p>
              </div>
            );
          })}
        </SeriesBox>
      </ContentBox>
    </Card>
  );
};

const ContentBox = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  margin: 0px 24px;
  align-items: center;
`;

const TitleBox = styled.div`
  display: flex;
  justify-content: center;
  min-width: 20%;
`;

const SeriesBox = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 32px;
  gap: 8px;
`;

export default DeviceVendorSelector;
