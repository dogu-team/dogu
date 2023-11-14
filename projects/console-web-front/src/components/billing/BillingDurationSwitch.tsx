import { Switch } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';

interface Props {}

const BillingDurationSwitch: React.FC<Props> = () => {
  return null;
  // const [isAnnual, updateIsAnnual] = useBillingPlanPurchaseStore(
  //   (state) => [state.isAnnual, state.updateIsAnnual],
  //   shallow,
  // );
  // const { t } = useTranslation('billing');

  // return (
  //   <SwitchWrapper>
  //     <Label>{t('periodMonthlyLabel')}</Label>
  //     <Switch checked={isAnnual} onChange={updateIsAnnual} style={{ margin: '0 .25rem' }} />
  //     <Label>
  //       {t('periodAnnuallyLabel')} <b>{`(${t('periodAnnuallySaveText', { save: 20 })})`}</b>
  //     </Label>
  //   </SwitchWrapper>
  // );
};

export default BillingDurationSwitch;

const SwitchWrapper = styled.div`
  margin: 0.5rem 0;
`;

const Label = styled.label`
  font-size: 0.8rem;

  b {
    color: ${(props) => props.theme.colorPrimary};
    font-weight 600;
  }
`;
