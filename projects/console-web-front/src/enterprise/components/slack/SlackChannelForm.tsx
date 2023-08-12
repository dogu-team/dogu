import { OrganizationId, SlackChannelItem } from '@dogu-private/types';
import { Form, FormInstance, Select } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';

import SlackChannelList from './SlackChannelList';
import SlackEventList from './SlackEventList';

type SlackChannelFormValues = {
  channelId: string;
  events: string[];
};

interface Props {
  channelItems: SlackChannelItem[];
  organizationId: OrganizationId;
  form: FormInstance<SlackChannelFormValues>;
}

const SlackChannelForm = (props: Props) => {
  const onSelectChannel = (channelId: string) => {
    props.form.setFieldsValue({ channelId });
  };

  const onSelectEvent = (events: string[]) => {
    props.form.setFieldsValue({ events });
  };

  if (props.channelItems.length === 0) {
    return (
      <>
        <p>
          {`You don't have any connected slack.`}
          <Link href={`/dashboard/${props.organizationId}/settings#slack`}> Please connect slack first.</Link>
        </p>
      </>
    );
  }

  return (
    <Form form={props.form} layout="vertical" name="slack-channel">
      <Form.Item
        label={
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', alignItems: 'center' }}>
            <p>Channel</p>
            <PrivateChannelGuideText href="" target="_blank">
              {`Private channel isn't visible?`}
            </PrivateChannelGuideText>
          </div>
        }
        name="channelId"
        required
        rules={[{ required: true, message: 'Please select a channel' }]}
      >
        <SlackChannelList
          channelItems={props.channelItems}
          defaultChannelId={props.form.getFieldValue('channelId')}
          organizationId={props.organizationId}
          onSelect={onSelectChannel}
        />
      </Form.Item>

      <Form.Item label="Event" name="events">
        <SlackEventList defaultEvents={props.form.getFieldValue('events')} onSelect={onSelectEvent} />
      </Form.Item>
    </Form>
  );
};

const PrivateChannelGuideText = styled.a`
  display: flex;
  justify-content: flex-end;
  font-size: 0.85rem;
  margin-left: 0.5rem;
`;

export default SlackChannelForm;
