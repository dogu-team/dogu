import { RoutineBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RoutineId } from '@dogu-private/types';
import { Button, Dropdown, MenuProps } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import { createPipeline } from '../../api/routine';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import RoutineSelector from 'src/components/routine/RoutineSelector';

interface Props {
  orgId: OrganizationId;
  projectId: ProjectId;
  routine?: RoutineBase;
}

const RunRoutineButton = ({ orgId, projectId, routine }: Props) => {
  const [loading, setLoading] = useState(false);
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();

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
      if (e instanceof AxiosError) {
        sendErrorNotification(t('routine:runRoutineFailureMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
    setLoading(false);
  };

  const items: MenuProps['items'] = [{ label: <RoutineSelector onRunClick={handleClick} />, key: 'routines' }];

  if (!routine) {
    return (
      <Dropdown trigger={['click']} menu={{ items }} destroyPopupOnHide>
        <Button type="primary" style={{ marginRight: '.5rem' }} loading={loading}>
          {t('routine:runRoutineButtonText')}
        </Button>
      </Dropdown>
    );
  }

  return (
    <Button
      type="primary"
      style={{ marginRight: '.5rem' }}
      loading={loading}
      onClick={() => handleClick(routine.routineId)}
      access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'run-routine-btn' : undefined}
    >
      {t('routine:runRoutineButtonText')}
    </Button>
  );
};

export default RunRoutineButton;
