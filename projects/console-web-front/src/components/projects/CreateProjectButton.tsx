import { PROJECT_TYPE } from '@dogu-private/types';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import useModal from '../../hooks/useModal';
import CreateProjectModal from './CreateProjectModal';

interface Props {
  projectType?: PROJECT_TYPE;
}

const CreateProjectButton: React.FC<Props> = ({ projectType }: Props) => {
  const [isOpen, openModal, closeModal] = useModal();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <>
      <Button
        type="primary"
        onClick={() => openModal()}
        access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'add-project-btn' : undefined}
      >
        {t('project:createProjectButtonTitle')}
      </Button>

      <CreateProjectModal
        isOpen={isOpen}
        close={closeModal}
        onCreate={(result) => {
          const moveTo = router.asPath.includes('?')
            ? `${router.asPath.split('?')[0]}/${result.projectId}/routines`
            : `${router.asPath}/${result.projectId}/routines`;
          router.push(moveTo);
        }}
        projectType={projectType}
      />
    </>
  );
};

export default CreateProjectButton;
