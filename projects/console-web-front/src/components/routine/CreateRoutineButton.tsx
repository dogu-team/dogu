import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

const CreateRoutineButton = () => {
  const router = useRouter();
  const creatorPath = router.asPath.replace(/\/routines(.+)?$/, '/routines/creator');

  return (
    <Link href={creatorPath}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'add-routine-btn' : undefined}
      />
    </Link>
  );
};

export default CreateRoutineButton;
