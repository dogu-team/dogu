import { OrganizationId, TEAM_NAME_MAX_LENGTH, TEAM_NAME_MIN_LENGTH } from '@dogu-private/types';
import { Button, Form, Input, notification } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { createTeam } from 'src/api/team';
import styled from 'styled-components';
import { AxiosError } from 'axios';

import useModal from 'src/hooks/useModal';
import useEventStore from 'src/stores/events';
import { getErrorMessage } from 'src/utils/error';
import FormControlModal from '../modals/FormControlModal';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';

const CreateTeamButton = () => {
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const fireEvent = useEventStore((state) => state.fireEvent);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
    } catch (e) {
      return;
    }

    try {
      const name = form.getFieldValue('name');
      await createTeam(organizationId, { name });
      form.setFieldValue('name', '');
      fireEvent('onTeamCreated');
      sendSuccessNotification(t('team:createNewTeamSuccessMsg'));
      closeModal();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('team:createNewTeamFailedMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  return (
    <>
      <StyledButton type="primary" onClick={() => openModal()} access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'create-team-btn' : undefined}>
        {t('team:createNewTeamButtonText')}
      </StyledButton>

      <FormControlModal
        open={isOpen}
        close={closeModal}
        title={t('team:createNewTeamModalTitle')}
        cancelText={t('common:cancel')}
        okText={t('common:add')}
        form={
          <Form layout="vertical" id="new-team" form={form} onFinish={handleSubmit}>
            <Form.Item label={t('team:createNewTeamModalNameLabel')} name="name" key="name" required rules={[{ required: true, message: 'Input team name' }]}>
              <Input placeholder={t('team:createNewTeamModalNamePlaceHolder')} minLength={TEAM_NAME_MIN_LENGTH} maxLength={TEAM_NAME_MAX_LENGTH} required autoFocus />
            </Form.Item>
          </Form>
        }
        formId="new-team"
        centered
        closable
      />
    </>
  );
};

export default CreateTeamButton;

const StyledButton = styled(Button)`
  margin-right: 0.5rem;
`;
