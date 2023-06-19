import { RoutineBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

interface Props {
  orgId: OrganizationId;
  projectId: ProjectId;
  routine?: RoutineBase;
}

const EditRoutineButton = ({ orgId, projectId, routine }: Props) => {
  const { t } = useTranslation();

  if (!routine) {
    return null;
  }

  return (
    <Link href={`/dashboard/${orgId}/projects/${projectId}/routines/editor?routineId=${routine?.routineId}`}>
      <Button type="primary" style={{ marginRight: '.5rem' }}>
        {t('routine:editRoutineButtonText')}
      </Button>
    </Link>
  );
};

export default EditRoutineButton;
