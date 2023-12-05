import { RoutineBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Props {
  orgId: OrganizationId;
  projectId: ProjectId;
  routine?: RoutineBase;
}

const EditRoutineButton = ({ orgId, projectId, routine }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();

  if (!routine) {
    return null;
  }

  return (
    <Link
      href={{
        pathname: router.pathname + '/editor',
        query: { orgId, pid: projectId, routineId: routine.routineId },
      }}
    >
      <Button type="primary" style={{ marginRight: '.5rem' }}>
        {t('routine:editRoutineButtonText')}
      </Button>
    </Link>
  );
};

export default EditRoutineButton;
