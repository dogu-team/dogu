import { OrganizationId, SlackChannelItem } from '@dogu-private/types';
import { Select, SelectProps } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import Link from 'next/link';

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

  const isConnectedSlack = channelItems?.length === 0;
  if (isConnectedSlack) {
    return (
      <>
        <p>
          {`You don't have any connected slack.`}
          <Link href={`/dashboard/${props.organizationId}/settings#slack`}> Please connect slack first.</Link>
        </p>
      </>
    );
  }

  return <Select defaultValue={props.defaultChannelId} showSearch placeholder="Select a channel" optionFilterProp="children" options={channels} onSelect={props.onSelect} />;
};
export default SlackChannelList;
