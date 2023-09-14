import { OrganizationId, SlackChannelItem } from '@dogu-private/types';
import { Select } from 'antd';
import { LockOutlined } from '@ant-design/icons';

interface Props {
  channelItems: SlackChannelItem[];
  organizationId: OrganizationId;
  defaultChannelId?: string;
  onSelect?: (channelId: string) => void;
}

const SlackChannelList = (props: Props) => {
  const { channelItems } = props;

  const channels = channelItems
    ? channelItems.map((channelItem) => {
        return {
          value: channelItem.channelId,
          children: channelItem.channelName,
          label: channelItem.isPrivate ? (
            <>
              <LockOutlined />
              <span> {channelItem.channelName}</span>
            </>
          ) : (
            `# ${channelItem.channelName}`
          ),
        };
      })
    : [];

  return (
    <Select
      defaultValue={props.defaultChannelId}
      showSearch
      placeholder="Select a channel"
      optionFilterProp="children"
      options={channels}
      onSelect={props.onSelect}
    />
  );
};
export default SlackChannelList;
