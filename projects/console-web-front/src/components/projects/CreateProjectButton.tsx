import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import useModal from '../../hooks/useModal';
import CreateProjectModal from './CreateProjectModal';

const CreateProjectButton = () => {
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
          router.push(`/dashboard/${result.organizationId}/projects/${result.projectId}`);
        }}
      />
    </>
  );
};

export default CreateProjectButton;
