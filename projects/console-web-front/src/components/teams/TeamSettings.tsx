import { TeamBase } from '@dogu-private/console';
import { OrganizationId, TEAM_NAME_MAX_LENGTH, TEAM_NAME_MIN_LENGTH } from '@dogu-private/types';
import { Button, Divider, Form, Input, message, notification } from 'antd';
import { AxiosError } from 'axios';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import { deleteTeam, updateTeam } from 'src/api/team';
import useEventStore from 'src/stores/events';
import { getErrorMessage } from 'src/utils/error';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import DangerZone from '../common/boxes/DangerZone';
import Trans from 'next-translate/Trans';
import SettingTitleDivider from '../common/SettingTitleDivider';

interface Props {
  organizationId: OrganizationId;
  team: TeamBase;
  onUpdateEnd?: (team: TeamBase) => void;
  onDeleteEnd?: () => void;
}

const TeamSettings = ({ organizationId, team, onDeleteEnd, onUpdateEnd }: Props) => {
  const [form] = Form.useForm();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();

  const handleFinish = async () => {
    const name = form.getFieldValue('name');

    if (name === team.name) {
      return;
    }

    try {
      const result = await updateTeam(organizationId, team.teamId, { name });
      sendSuccessNotification(t('team:teamUpdateSuccessMsg'));
      fireEvent<TeamBase>('onTeamUpdated', result);
      onUpdateEnd?.(result);
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('team:teamUpdateFailureMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTeam(organizationId, team.teamId);
      sendSuccessNotification(t('team:removeTeamSuccessMessage'));
      fireEvent('onTeamDeleted');
      onDeleteEnd?.();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('team:removeTeamFailureMessage', { reason: getErrorMessage(e) }));
      }
    }
  };

  return (
    <Box>
      <SettingTitleDivider title="General" style={{ marginTop: '0' }} />
      <Form layout="vertical" form={form} initialValues={{ name: team.name }} onFinish={handleFinish} autoComplete="off">
        <Form.Item label={t('team:teamDetailPageSettingNameLabel')} name="name" required rules={[{ required: true, message: t('team:teamDetailPageSettingNameEmptyMsg') }]}>
          <Input minLength={TEAM_NAME_MIN_LENGTH} maxLength={TEAM_NAME_MAX_LENGTH} required placeholder={t('team:teamDetailPageSettingNamePlaceholder')} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" access-id="update-team-profile-btn">
            {t('common:save')}
          </Button>
        </Form.Item>
      </Form>

      <div style={{ marginTop: '3rem' }}>
        <DangerZone>
          <DangerZone.Item
            title={t('team:removeTeamMenuTitle')}
            description={t('team:removeTeamMenuDescriptionText')}
            button={
              <DangerZone.Button
                modalTitle={t('team:removeTeamConfirmModalTitle')}
                modalContent={
                  <Trans i18nKey="team:removeTeamConfirmModalContent" components={{ b: <b style={{ fontWeight: '700' }} />, br: <br /> }} values={{ name: team.name }} />
                }
                modalButtonTitle={t('team:removeTeamConfirmModalButtonTitle')}
                onConfirm={handleDelete}
                access-id="remove-team-btn"
                buttonProps={{
                  id: 'remove-team-confirm-btn',
                }}
              >
                {t('team:removeTeamButtonText')}
              </DangerZone.Button>
            }
          />
        </DangerZone>
      </div>
    </Box>
  );
};

export default TeamSettings;

const Box = styled.div`
  max-width: 500px;
`;
