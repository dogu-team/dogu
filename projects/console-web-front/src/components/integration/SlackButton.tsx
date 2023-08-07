import { useRouter } from 'next/router';

import SlackIcon from 'public/resources/icons/slack.svg';
import { OrganizationIntegrationButtonProps } from '../../types/props';
import IntegrationConnectButton from './ConnectButton';
import IntegrationButton from './IntegrationCard';

function SlackButton({ isConnected, organizationId }: OrganizationIntegrationButtonProps) {
  const router = useRouter();

  return (
    <IntegrationButton
      icon={<SlackIcon style={{ width: '24px', height: '24px' }} />}
      name="Slack"
      description="Send notifications to Slack"
      connectButton={
        <IntegrationConnectButton
          isConnected={isConnected}
          onClick={() => open('https://slack.com/oauth/v2/authorize?client_id=2910592940257.5689283091841&scope=chat:write,chat:write.public&user_scope=')}
        />
      }
    />
  );
}

export default SlackButton;
