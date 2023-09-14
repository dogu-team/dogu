import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Link from 'next/link';

const CreateRoutineButton = ({ organizationId, projectId }: { organizationId: string; projectId: string }) => {
  return (
    <Link href={`/dashboard/${organizationId}/projects/${projectId}/routines/creator`}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'add-routine-btn' : undefined}
      />
    </Link>
  );
};

export default CreateRoutineButton;
