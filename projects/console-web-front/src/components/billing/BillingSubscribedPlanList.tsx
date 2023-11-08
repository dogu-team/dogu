import {
  BillingPlanGroupMap,
  BillingSubscriptionGroupType,
  BillingSubscriptionPlanInfoResponse,
  CloudLicenseResponse,
  SelfHostedLicenseBase,
} from '@dogu-private/console';
import { Alert, List, MenuProps, Tag } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import { cancelUnsubscribePlan, unsubscribePlan } from '../../api/billing';
import useModal from '../../hooks/useModal';
import useRequest from '../../hooks/useRequest';
import { planDescriptionInfoMap } from '../../resources/plan';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import useLicenseStore from '../../stores/license';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getLocaleFormattedDate } from '../../utils/locale';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import UpgradePlanModal from './UpgradePlanModal';

interface OptionProps {
  plan: BillingSubscriptionPlanInfoResponse;
}

const PlanOption: React.FC<OptionProps> = ({ plan }) => {
  const { t } = useTranslation('billing');
  const router = useRouter();
  const [isOpen, openModal, closeModal] = useModal();
  const updateGroupType = useBillingPlanPurchaseStore((state) => state.updateBillingGroupType);

  const description = planDescriptionInfoMap[plan.type];
  const isAnnual = plan.period === 'yearly';

  const clickChangeOption = () => {
    const groupType = BillingSubscriptionGroupType.find((group) => BillingPlanGroupMap[group].includes(plan.type));
    updateGroupType(groupType ?? null);
    openModal();
  };

  return (
    <div>
      <div>
        {t(description.getOptionLabelI18nKey(plan.option), { option: plan.option })} /{' '}
        {t(isAnnual ? 'monthCountPlural' : 'monthCountSingular', { month: isAnnual ? 12 : 1 })}
      </div>
      {plan.state === 'change-option-or-period-requested' && plan.changeRequestedOption && (
        <div style={{ marginTop: '.25rem' }}>
          <ChangeRequestedOptionText>
            From next charge, changed to{' '}
            {t(description.getOptionLabelI18nKey(plan.changeRequestedOption), { option: plan.changeRequestedOption })} /{' '}
            {t(plan.changeRequestedPeriod === 'yearly' ? 'monthCountPlural' : 'monthCountSingular', {
              month: plan.changeRequestedPeriod === 'yearly' ? 12 : 1,
            })}
          </ChangeRequestedOptionText>
          <ChangeOptionButton onClick={clickChangeOption}>Change option</ChangeOptionButton>

          <UpgradePlanModal isOpen={isOpen} close={closeModal} />
        </div>
      )}
    </div>
  );
};

interface NextChargeProps {
  plan: BillingSubscriptionPlanInfoResponse;
}

const NextCharge: React.FC<NextChargeProps> = ({ plan }) => {
  const router = useRouter();
  const { t } = useTranslation('billing');

  if (plan.state === 'unsubscribe-requested') {
    return (
      <div>
        {t('planNextChargeUnsubscribeRequestedText', {
          date: getLocaleFormattedDate(router.locale, new Date((plan.monthlyExpiredAt || plan.yearlyExpiredAt)!), {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
          }),
        })}
      </div>
    );
  }

  return (
    <div>
      {!!(plan.monthlyExpiredAt || plan.yearlyExpiredAt)
        ? getLocaleFormattedDate(router.locale, new Date((plan.monthlyExpiredAt || plan.yearlyExpiredAt)!), {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          })
        : 'N/A'}
    </div>
  );
};

interface StateProps {
  plan: BillingSubscriptionPlanInfoResponse;
}

const StateBadge: React.FC<StateProps> = ({ plan }) => {
  const { t } = useTranslation('billing');
  const [license, updateLicense] = useLicenseStore((state) => [state.license, state.updateLicense], shallow);
  const [loading, requestCancelUnsubscribePlan] = useRequest(cancelUnsubscribePlan);
  const updateGroupType = useBillingPlanPurchaseStore((state) => state.updateBillingGroupType);
  const [isOpen, openModal, closeModal] = useModal();

  const clickCancelUnsubscribe = async () => {
    if (!license) {
      return null;
    }

    if (plan.state === 'unsubscribed') {
      const groupType = BillingSubscriptionGroupType.find((group) => BillingPlanGroupMap[group].includes(plan.type));
      updateGroupType(groupType ?? null);
      openModal();
      return;
    }

    try {
      const rv = await requestCancelUnsubscribePlan(plan.billingSubscriptionPlanInfoId, {
        organizationId: license.organizationId,
      });

      if (rv.errorMessage || !rv.body) {
        sendErrorNotification('Failed to cancel unsubscribe plan. Please try again later.');
        return;
      }

      updateLicense({
        ...license,
        billingOrganization: {
          ...license.billingOrganization,
          billingSubscriptionPlanInfos: [
            ...license.billingOrganization.billingSubscriptionPlanInfos.filter(
              (p) => p.billingSubscriptionPlanInfoId !== plan.billingSubscriptionPlanInfoId,
            ),
            rv.body,
          ],
        },
      });
      sendSuccessNotification('Successfully cancel unsubscribed plan.');
    } catch (e) {}
  };

  switch (plan.state) {
    case 'subscribed':
    case 'change-option-or-period-requested':
      return (
        <div>
          <Tag color="green-inverse">{t('planStatusSubscribedText')}</Tag>
        </div>
      );
    case 'unsubscribe-requested':
    case 'unsubscribed':
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Tag color="error">{t('planStatusUnsubscribedText')}</Tag>
          <StyledCancelUnsubscribeButton onClick={clickCancelUnsubscribe} disabled={loading}>
            {t('planCancelUnsubscribeButtonText')}
          </StyledCancelUnsubscribeButton>

          <UpgradePlanModal isOpen={isOpen} close={closeModal} />
        </div>
      );
    default:
      return <Tag color="error">Error</Tag>;
  }
};

interface ItemProps {
  plan: BillingSubscriptionPlanInfoResponse;
}

const PlanItem: React.FC<ItemProps> = ({ plan }) => {
  const [license, updateLicense] = useLicenseStore((state) => [state.license, state.updateLicense], shallow);
  const { t } = useTranslation('billing');

  const description = planDescriptionInfoMap[plan.type];

  const handleUnsubscribe = async () => {
    if (!license) {
      return;
    }

    try {
      const rv = await unsubscribePlan(plan.billingSubscriptionPlanInfoId, {
        organizationId: license.organizationId as string,
      });

      if (rv.errorMessage) {
        sendErrorNotification('Failed to unsubscribe plan. Please try again later.');
        return;
      }

      updateLicense({
        ...license,
        billingOrganization: {
          ...license.billingOrganization,
          billingSubscriptionPlanInfos: [
            ...license.billingOrganization.billingSubscriptionPlanInfos.filter(
              (p) => p.billingSubscriptionPlanInfoId !== plan.billingSubscriptionPlanInfoId,
            ),
            rv.body!,
          ],
        },
      });
      sendSuccessNotification('Successfully unsubscribed plan.');
    } catch (e) {
      sendErrorNotification('Failed to unsubscribe plan. Please try again later.');
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleUnsubscribe}
          modalTitle={t('cancelPlanModalTitle')}
          modalButtonTitle={t('cancelPlanModalConfirmButtonText')}
          modalContent={
            <div>
              <p>{t('cancelPlanModalDescription')}</p>
              <Alert
                style={{
                  marginTop: '.5rem',
                }}
                message={
                  <div>
                    Plan: <b>{t(description.titleI18nKey)}</b>{' '}
                    <span>
                      {`(${t(description.getOptionLabelI18nKey(plan.option), { option: plan.option })})`} /{' '}
                      {t(plan.period === 'yearly' ? 'monthCountPlural' : 'monthCountSingular', {
                        month: plan.period === 'yearly' ? 12 : 1,
                      })}
                    </span>
                  </div>
                }
                type="error"
              />
            </div>
          }
          disabled={plan.state === 'unsubscribed' || plan.state === 'unsubscribe-requested'}
        >
          {t('cancelPlanButtonText')}
        </MenuItemButton>
      ),
      key: 'cancel',
    },
  ];

  return (
    <Item>
      <ItemInner>
        <Cell flex={1}>
          <b>{t(description.titleI18nKey)}</b>
        </Cell>
        <Cell flex={1}>
          <PlanOption plan={plan} />
        </Cell>
        <Cell flex={1}>
          <StateBadge plan={plan} />
        </Cell>
        <Cell flex={1}>
          <NextCharge plan={plan} />
        </Cell>
        <ButtonWrapper>
          <MenuButton menu={{ items }} />
        </ButtonWrapper>
      </ItemInner>
    </Item>
  );
};

interface Props {}

const BillingSubscribedPlanList: React.FC<Props> = () => {
  const { t } = useTranslation('billing');
  const license = useLicenseStore((state) => state.license);

  console.log(license);

  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    const selfHostedLicense = license as SelfHostedLicenseBase;

    return <div>Self hosted billing</div>;
  }

  const cloudLicense = license as CloudLicenseResponse;
  const subscribedPlans = cloudLicense.billingOrganization?.billingSubscriptionPlanInfos;

  if (!subscribedPlans || subscribedPlans.length === 0) {
    return (
      <Alert
        type="info"
        message={
          <p>
            Your organization is using <b style={{ fontWeight: '600' }}>Free plan</b>.
          </p>
        }
      />
    );
  }

  return (
    <>
      <Header>
        <ItemInner>
          <Cell flex={1}>{t('planNameColumnText')}</Cell>
          <Cell flex={1}>{t('planOptionColumnText')}</Cell>
          <Cell flex={1}>{t('planStatusColumnText')}</Cell>
          <Cell flex={1}>{t('planNextChargeDateColumnText')}</Cell>
          <ButtonWrapper />
        </ItemInner>
      </Header>
      <List
        dataSource={subscribedPlans}
        renderItem={(plan) => <PlanItem plan={plan} />}
        rowKey={(plan) => plan.billingSubscriptionPlanInfoId}
      />
    </>
  );
};

export default BillingSubscribedPlanList;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const ItemInner = styled.div`
  ${flexRowBaseStyle}
`;

const Cell = styled.div<{ flex: number }>`
  ${tableCellStyle}
  flex: ${(props) => props.flex};
`;

const ButtonWrapper = styled.div`
  width: 48px;
  display: flex;
  justify-content: flex-end;
`;

const StyledCancelUnsubscribeButton = styled.button`
  padding: 0.25rem;
  background-color: transparent;
  font-size: 0.8rem;
  text-decoration: underline;
  color: ${(props) => props.theme.colorPrimary};
`;

const ChangeRequestedOptionText = styled.span`
  font-size: 0.8rem;
  color: ${(props) => props.theme.main.colors.gray3};
`;

const ChangeOptionButton = styled.button`
  margin: 0 0.25rem;
  padding: 0.25rem;
  background-color: transparent;
  font-size: 0.8rem;
  text-decoration: underline;
  color: ${(props) => props.theme.colorPrimary};
`;
