import {
  BillingSubscriptionPlanInfoResponse,
  CloudLicenseBase,
  CloudLicenseResponse,
  SelfHostedLicenseBase,
} from '@dogu-private/console';
import { Alert, List, MenuProps } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';
import { unsubscribePlan } from '../../api/billing';

import { planDescriptionInfoMap } from '../../resources/plan';
import useLicenseStore from '../../stores/license';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { sendErrorNotification } from '../../utils/antd';
import { getLocaleFormattedDate } from '../../utils/locale';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';

interface ItemProps {
  plan: BillingSubscriptionPlanInfoResponse;
}

const PlanItem: React.FC<ItemProps> = ({ plan }) => {
  const [license, updateLicense] = useLicenseStore((state) => [state.license, state.updateLicense], shallow);
  const { t } = useTranslation('billing');
  const router = useRouter();

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
          modalTitle={'Cancel plan'}
          modalButtonTitle={'Unsubscribe'}
          modalContent={
            <div>
              <p>Are you sure to cancel plan?</p>
              <p>
                Plan: {t(description.titleI18nKey)}{' '}
                {`(${t(description.getOptionLabelI18nKey(plan.option), { option: plan.option })})`}
              </p>
            </div>
          }
        >
          Cancel plan
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
        <Cell flex={1}>{t(description.getOptionLabelI18nKey(plan.option), { option: plan.option })}</Cell>
        <Cell flex={1}>{plan.state}</Cell>
        <Cell flex={1}>
          {!!(plan.monthlyExpiredAt || plan.yearlyExpiredAt)
            ? getLocaleFormattedDate(
                router.locale ?? 'en',
                new Date((plan.monthlyExpiredAt || plan.yearlyExpiredAt)!),
                {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                },
              )
            : 'N/A'}
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
          <Cell flex={1}>Name</Cell>
          <Cell flex={1}>Options</Cell>
          <Cell flex={1}>Status</Cell>
          <Cell flex={1}>Next Charge</Cell>
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
