import { Button, Form, Modal } from 'antd';
import styled from 'styled-components';
import { OrganizationId, ProjectId, SlackChannelItem } from '@dogu-private/types';
import { ProjectSlackRemoteBase } from '@dogu-private/console';
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import SlackIcon from 'public/resources/icons/slack.svg';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../api';
import SlackChannelForm from './SlackChannelForm';
import { updateProjectSlackRemote } from '../../../api/project-slack';
import { sendSuccessNotification } from '../../../utils/antd';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  hide: boolean;
  remoteSlack?: ProjectSlackRemoteBase;
}

interface FormFields {
  channelId: string;
  events: string[];
}

const SlackRemoteChannelButton = (props: Props) => {
  const isSaved = useRef(false);
  const pureFormValues = useRef<FormFields>({ channelId: '', events: [] });
  const [form] = Form.useForm<FormFields>();
  const [isOpen, setIsOpen] = useState(false);
  const { data: channelItems, error, mutate, isLoading } = useSWR<SlackChannelItem[]>(`/organizations/${props.organizationId}/slack/channels`, swrAuthFetcher);

  const initFormValues = useCallback(() => {
    if (props.remoteSlack) {
      const events: string[] = [];

      if (props.remoteSlack.onSuccess) {
        events.push('on-success');
      }
      if (props.remoteSlack.onFailure) {
        events.push('on-failure');
      }

      form.setFieldsValue({
        channelId: props.remoteSlack.channelId,
        events: events,
      });
      pureFormValues.current = form.getFieldsValue();
    }
  }, [props.remoteSlack]);

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
    await updateProjectSlackRemote(props.organizationId, props.projectId, {
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

      <Modal
        open={isOpen}
        onCancel={handleClose}
        okText={'Save'}
        onOk={handleSave}
        title="Slack"
        okButtonProps={{ hidden: channelItems?.length === 0 }}
        cancelButtonProps={{ hidden: channelItems?.length === 0 }}
        centered
        closable
        destroyOnClose
      >
        <SlackChannelForm organizationId={props.organizationId} form={form} channelItems={channelItems ? channelItems : []} />
      </Modal>
    </>
  );
};

export default SlackRemoteChannelButton;

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
