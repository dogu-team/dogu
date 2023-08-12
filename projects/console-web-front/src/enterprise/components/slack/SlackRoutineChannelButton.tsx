import { Button, Form, Modal } from 'antd';
import styled from 'styled-components';
import { OrganizationId, ProjectId, RoutineId, SlackChannelItem } from '@dogu-private/types';
import { ProjectSlackRoutineBase } from '@dogu-private/console';
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import SlackIcon from 'public/resources/icons/slack.svg';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../api';
import SlackChannelForm from './SlackChannelForm';
import { updateProjectSlackRoutine } from '../../../api/project-slack';
import { sendSuccessNotification } from '../../../utils/antd';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  routineId: RoutineId;
  hide: boolean;
  routineSlack?: ProjectSlackRoutineBase;
}

interface FormFields {
  channelId: string;
  events: string[];
}

const SlackRoutineChannelButton = (props: Props) => {
  const isSaved = useRef(false);
  const pureFormValues = useRef<FormFields>({ channelId: '', events: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm<FormFields>();
  const { data: channelItems, error, mutate, isLoading } = useSWR<SlackChannelItem[]>(`/organizations/${props.organizationId}/slack/channels`, swrAuthFetcher);

  const initFormValues = useCallback(() => {
    if (props.routineSlack) {
      const events: string[] = [];

      if (props.routineSlack.onSuccess) {
        events.push('on-success');
      }
      if (props.routineSlack.onFailure) {
        events.push('on-failure');
      }

      form.setFieldsValue({
        channelId: props.routineSlack.channelId,
        events: events,
      });
      pureFormValues.current = form.getFieldsValue();
    }
  }, [props.routineSlack]);

  const handleOpen = (e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent> | MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);

    if (!isSaved.current) {
      form.setFieldsValue(pureFormValues.current);
    }
  };

  const handleSave = async () => {
    const channelId = form.getFieldValue('channelId');
    const events = form.getFieldValue('events') ? form.getFieldValue('events') : [];
    const onSuccess = events.includes('on-success');
    const onFailure = events.includes('on-failure');

    await form.validateFields();
    await updateProjectSlackRoutine(props.organizationId, props.projectId, {
      routineId: props.routineId,
      channelId: channelId,
      onSuccess: onSuccess,
      onFailure: onFailure,
    });

    isSaved.current = true;
    sendSuccessNotification('Slack channel has been updated');
    handleClose();
  };

  useEffect(() => {
    isSaved.current = false;
  }, [isOpen]);

  useEffect(() => {
    initFormValues();
  }, [initFormValues]);

  if (props.hide) {
    return null;
  }

  return (
    <>
      <StyledButton icon={<SlackIcon style={{ width: '16px', height: '16px' }} />} onClick={handleOpen}>
        <p style={{ marginLeft: '.5rem' }}>Slack</p>
      </StyledButton>

      <Modal open={isOpen} centered closable onCancel={handleClose} okText={'Save'} onOk={handleSave} title="Slack" destroyOnClose>
        <SlackChannelForm organizationId={props.organizationId} form={form} channelItems={channelItems ? channelItems : []} />
      </Modal>
    </>
  );
};

export default SlackRoutineChannelButton;

const StyledButton = styled(Button)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  padding: 4px 8px;
  cursor: pointer;

  &:active {
    color: ${(props) => props.theme.colorPrimary} !important;
  }
`;
