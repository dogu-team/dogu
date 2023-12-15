import { RoutineBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, PROJECT_TYPE, RoutineId } from '@dogu-private/types';
import { Button, Dropdown, MenuProps } from 'antd';
import { AxiosError, isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import { createPipeline } from '../../api/routine';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import RoutineSelector from 'src/components/routine/RoutineSelector';
import { isPaymentRequired } from '../../../enterprise/utils/error';
import useModal from '../../hooks/useModal';
import useProjectContext from '../../hooks/context/useProjectContext';
import UpgradePlanModal from '../billing/UpgradePlanModal';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';

interface Props {
  orgId: OrganizationId;
  projectId: ProjectId;
  routine?: RoutineBase;
}

const RunRoutineButton = ({ orgId, projectId, routine }: Props) => {
  const [loading, setLoading] = useState(false);
  const { project } = useProjectContext();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const [isOpen, openModal, closeModal] = useModal();
  const { t } = useTranslation();
  const updateBillingGroupType = useBillingPlanPurchaseStore((state) => state.updateBillingGroupType);

  const handleClick = async (routineId: RoutineId) => {
    if (!routineId) {
      return;
    }

    setLoading(true);
    try {
      await createPipeline(orgId, projectId, routineId);
      sendSuccessNotification(t('routine:runRoutineSuccessMsg'));
      fireEvent('onPipelineCreated');
    } catch (e) {
      if (isAxiosError(e)) {
        if (isPaymentRequired(e)) {
          openModal();
          switch (project?.type) {
            case PROJECT_TYPE.WEB:
              updateBillingGroupType('web-test-automation-group');
              break;
            case PROJECT_TYPE.APP:
              updateBillingGroupType('mobile-app-test-automation-group');
              break;
            case PROJECT_TYPE.GAME:
              updateBillingGroupType('mobile-game-test-automation-group');
              break;
            default:
              updateBillingGroupType(null);
              break;
          }
        } else {
          sendErrorNotification(t('routine:runRoutineFailureMsg', { reason: getErrorMessageFromAxios(e) }));
        }
      }
    }
    setLoading(false);
  };

  const items: MenuProps['items'] = [{ label: <RoutineSelector onRunClick={handleClick} />, key: 'routines' }];

  if (!routine) {
    return (
      <>
        <Dropdown trigger={['click']} menu={{ items }} destroyPopupOnHide>
          <Button type="primary" style={{ marginRight: '.5rem' }} loading={loading}>
            {t('routine:runRoutineButtonText')}
          </Button>
        </Dropdown>
        <UpgradePlanModal isOpen={isOpen} close={closeModal} />
      </>
    );
  }

  return (
    <>
      <Button
        type="primary"
        style={{ marginRight: '.5rem' }}
        loading={loading}
        onClick={() => handleClick(routine.routineId)}
        access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'run-routine-btn' : undefined}
      >
        {t('routine:runRoutineButtonText')}
      </Button>
      <UpgradePlanModal isOpen={isOpen} close={closeModal} />
    </>
  );
};

export default RunRoutineButton;
