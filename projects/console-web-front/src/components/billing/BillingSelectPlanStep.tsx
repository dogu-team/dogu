import { BillingPlanGroupMap, BillingSubscriptionGroupType, BillingSubscriptionPlanMap } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import { Fragment, useState } from 'react';
import { RiExternalLinkLine } from 'react-icons/ri';
import styled from 'styled-components';

import { groupTypeI18nKeyMap, planDescriptionInfoMap } from '../../resources/plan';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import useLicenseStore from '../../stores/license';
import { getSubscriptionPlansFromLicense } from '../../utils/billing';
import ErrorBox from '../common/boxes/ErrorBox';
import BillingDurationSwitch from './BillingDurationSwitch';
import PlanItem from './PlanItem';

interface Props {}

const BillingSelectPlanStep: React.FC<Props> = ({}) => {
  const [currentGroup, setCurrentGroup] = useState(BillingSubscriptionGroupType[0]);
  const license = useLicenseStore((state) => state.license);
  const groupType = useBillingPlanPurchaseStore((state) => state.billingGroupType);
  const { t } = useTranslation('billing');

  if (!license) {
    return <ErrorBox title="Something went wrong" desc="No license information" />;
  }

  const planTypes = groupType ? BillingPlanGroupMap[groupType] : BillingPlanGroupMap[currentGroup];
  const usingPlans = getSubscriptionPlansFromLicense(license, planTypes);

  const handleClickGroupButton = (group: BillingSubscriptionGroupType) => {
    setCurrentGroup(group);
  };

  return (
    <div>
      <CurrentPlanWrapper>
        {/* TODO: from user's current plan */}
        <CurrentPlanText>
          {t('currentPlanText')}:{' '}
          <span>
            {planTypes.map((planType, i) => {
              const planInfo = BillingSubscriptionPlanMap[planType];
              const descriptionInfo = planDescriptionInfoMap[planType];
              const usingPlan = usingPlans.find((plan) => plan.type === planType);
              const isAnnual = usingPlan?.period === 'yearly';

              return (
                <Fragment key={planType}>
                  <span>
                    <b>{t(descriptionInfo.titleI18nKey)}</b>{' '}
                    {!!usingPlan
                      ? `(${t(descriptionInfo.getOptionLabelI18nKey(usingPlan.option), {
                          option: usingPlan.option,
                        })}) / ${t(isAnnual ? 'monthCountPlural' : 'monthCountSingular', {
                          month: isAnnual ? 12 : 1,
                        })}`
                      : 'Free'}
                  </span>
                  {i !== planTypes.length - 1 && <span>, </span>}
                </Fragment>
              );
            })}
          </span>
        </CurrentPlanText>
      </CurrentPlanWrapper>

      <FlexEnd style={{ margin: '.5rem 0' }}>
        <BillingDurationSwitch />
      </FlexEnd>

      <PlanContent>
        {!groupType && (
          <PlanSidebar>
            {BillingSubscriptionGroupType.map((group) => (
              <PlanGroupButton
                key={group}
                isSelected={group === currentGroup}
                onClick={() => handleClickGroupButton(group)}
              >
                {t(groupTypeI18nKeyMap[group])}
              </PlanGroupButton>
            ))}
          </PlanSidebar>
        )}

        <PlanWrapper style={{ justifyContent: groupType ? 'center' : 'flex-start' }}>
          {planTypes.map((planType) => {
            const planInfo = BillingSubscriptionPlanMap[planType];
            const descriptionInfo = planDescriptionInfoMap[planType];
            return (
              <PlanItem key={planType} planType={planType} planInfo={planInfo} descriptionInfo={descriptionInfo} />
            );
          })}
        </PlanWrapper>
      </PlanContent>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <a href="https://dogutech.io/pricing" target="_blank" style={{ fontSize: '.8rem' }}>
          {t('seeDetailsText')}&nbsp;
          <RiExternalLinkLine />
        </a>
      </div>
    </div>
  );
};

export default BillingSelectPlanStep;

const CurrentPlanWrapper = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background-color: ${(props) => props.theme.colorPrimary}22;
`;

const CurrentPlanText = styled.p`
  font-size: 0.8rem;

  b {
    font-weight: 600;
  }
`;

const PlanContent = styled.div`
  display: flex;
`;

const PlanSidebar = styled.div`
  width: 10rem;
  margin-right: 1rem;
`;

const PlanGroupButton = styled.button<{ isSelected: boolean }>`
  width: 100%;
  padding: 0.5rem 1rem;
  border-left: 2px solid ${(props) => (props.isSelected ? props.theme.colorPrimary : '#ccc')};
  color: ${(props) => (props.isSelected ? props.theme.colorPrimary : '#333')};
  margin-bottom: 0.5rem;
  background-color: #fff;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.colorPrimary}22;
  }
`;

const PlanWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const FlexEnd = styled.div`
  display: flex;
  justify-content: flex-end;
`;
