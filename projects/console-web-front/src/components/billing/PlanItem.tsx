import { CloudSubscriptionPlanInfo } from '@dogu-private/console';
import { Button, Divider, Select, SelectProps } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { PlanDescriptionInfo } from '../../resources/plan';

interface Props {
  planInfo: CloudSubscriptionPlanInfo;
  descriptionInfo: PlanDescriptionInfo;
  isAnnual: boolean;
  onClickUpgrade: () => void;
}

const PlanItem: React.FC<Props> = ({ planInfo, descriptionInfo, onClickUpgrade, isAnnual }) => {
  const baseOptions: SelectProps<string | number>['options'] = Object.keys(planInfo.optionMap).map((optionKey) => {
    return {
      value: optionKey,
      label: descriptionInfo.getOptionLabelText(optionKey),
    };
  });
  const options = descriptionInfo.lastContactUsOptionKey
    ? [...baseOptions, { value: 'contact-us', label: descriptionInfo.lastContactUsOptionKey }]
    : baseOptions;

  const [selectedValue, setSelectedValue] = useState<string | number | null | undefined>(() => {
    // TODO: from user's current plan
    return options[0].value;
  });

  const handleChangeOption = (value: string | number) => {
    setSelectedValue(value);
  };

  return (
    <Box>
      <div>
        <div>
          <PricingTitle>{descriptionInfo.titleI18nKey}</PricingTitle>
        </div>
        <div style={{ marginBottom: '.5rem' }}>
          <PricingPrice>{isAnnual ? 'price / year' : 'price / month'}</PricingPrice>
        </div>
        <div style={{ marginBottom: '.5rem' }}>
          <Select<string | number>
            style={{ width: '100%' }}
            options={options}
            value={selectedValue}
            onChange={handleChangeOption}
            dropdownMatchSelectWidth={false}
          />
        </div>
        <div>
          {/* change, upgrade or go annual */}
          <Button type="primary" style={{ width: '100%' }} onClick={onClickUpgrade}>
            Upgrade
          </Button>
        </div>
        <Divider />
        <div>
          <ul>
            {descriptionInfo.featureI18nKeys.map((featureKey) => (
              <li key={featureKey}>{featureKey}</li>
            ))}
          </ul>
        </div>
      </div>
    </Box>
  );
};

export default PlanItem;

const Box = styled.div`
  width: 250px;
  height: 500px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.75rem;
  line-height: 1.5;
`;

const PricingTitle = styled.b`
  font-size: 1.2rem;
  font-weight: 700;
`;

const PricingPrice = styled.span`
  font-size: 1.5rem;
`;
