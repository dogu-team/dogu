import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { countryVendorStatistics, Vendor } from '@dogu-private/device-data';

import useResponsiveWebTestingContext from '../hook/useResponsiveWebTestingContext';
import { getVendorColor } from '../util/vendorColor';

interface MarketShare {
  country: string;
  [vendor: string]: number | string;
}

interface Props {}

const defaultCountryMarketShares: MarketShare[] = countryVendorStatistics.map((countryVendorMarketShare) => {
  return {
    country: countryVendorMarketShare.country,
  };
});

const renderPercent = (value: number) => `${value}%`;

const VendorMarketShare = ({}: Props) => {
  const [currentMarketShares, setCurrentMarketShares] = useState<MarketShare[]>(defaultCountryMarketShares);
  const { selectedVendors } = useResponsiveWebTestingContext();
  const { t } = useTranslation();

  const calculateMarketShare = () => {
    const calcedCountryMarketShares: MarketShare[] = [];

    for (const vendor of selectedVendors) {
      for (const countryVendorMarketShare of countryVendorStatistics) {
        const countryMarketShare = calcedCountryMarketShares.find(
          (marketShare) => marketShare.country === countryVendorMarketShare.country,
        );

        if (countryMarketShare) {
          countryMarketShare[vendor] = parseFloat(Number(countryVendorMarketShare.marketShare[vendor]).toFixed(1));
        } else {
          calcedCountryMarketShares.push({
            country: countryVendorMarketShare.country,
            [vendor]: parseFloat(countryVendorMarketShare.marketShare[vendor].toFixed(1)),
          });
        }
      }
    }

    setCurrentMarketShares(
      calcedCountryMarketShares.sort((a, b) => {
        const aVendors = Object.keys(a).filter((key) => key !== 'country');
        const bVendors = Object.keys(b).filter((key) => key !== 'country');

        let aTotal = 0;
        aVendors.forEach((vendor) => {
          aTotal += a[vendor] as number;
        });

        let bTotal = 0;
        bVendors.forEach((vendor) => {
          bTotal += b[vendor] as number;
        });

        return bTotal - aTotal;
      }),
    );
  };

  useEffect(() => {
    if (selectedVendors.length === 0) {
      setCurrentMarketShares(defaultCountryMarketShares);
    } else {
      calculateMarketShare();
    }
  }, [selectedVendors]);

  return (
    <BarChart width={720} height={currentMarketShares.length * 90} data={currentMarketShares} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" domain={[0, 100]} tickFormatter={renderPercent} />
      <YAxis type="category" dataKey="country" width={110} />
      <Tooltip formatter={renderPercent} />
      <Legend />
      {selectedVendors.map((selectedVendor) => {
        return (
          <Bar
            key={selectedVendor}
            dataKey={selectedVendor}
            stackId="none"
            barSize={36}
            fill={getVendorColor(selectedVendor)}
          />
        );
      })}
    </BarChart>
  );
};

export default VendorMarketShare;
