import { isAxiosError } from 'axios';
import SlackIcon from 'public/resources/icons/slack.svg';
import { useState } from 'react';
import { disconnectSlack } from '../../../api/slack';
import useRequest from '../../../hooks/useRequest';
import { OrganizationIntegrationButtonProps } from '../../../types/props';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import IntegrationConnectButton from '../../../components/integration/ConnectButton';
import DisconnectButton from '../../../components/integration/DisconnectButton';
import IntegrationButton from '../../../components/integration/IntegrationCard';

function SlackButton(props: OrganizationIntegrationButtonProps) {
  const [loading, disconnectOrgSlack] = useRequest(disconnectSlack);
  const [isConnected, setIsConnected] = useState<boolean>(props.isConnected);

  const disconnect = async () => {
    try {
      await disconnectOrgSlack(props.organizationId);
      sendSuccessNotification('Slack disconnected');
      setIsConnected(false);
    } catch (error) {
      if (isAxiosError(error)) {
        sendErrorNotification('Cannot disconnect Slack');
      }
    }
  };

  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    return null;
  }

  return (
    <IntegrationButton
      id={'slack'}
      icon={<SlackIcon style={{ width: '24px', height: '24px' }} />}
      name="Slack"
      description="Send notifications to Slack"
      connectButton={
        isConnected ? (
          <DisconnectButton
            modalTitle={'Disconnect with Slack'}
            modalContent={<p>Are you sure you want to disconnect with Slack?</p>}
            modalButtonTitle={'Confirm & disconnect'}
            onConfirm={disconnect}
            loading={loading}
          >
            Disconnect
          </DisconnectButton>
        ) : (
          <IntegrationConnectButton
            isConnected={isConnected}
            onClick={() =>
              open(
                'https://slack.com/oauth/v2/authorize?test=103&client_id=2910592940257.5689283091841&scope=chat:write,chat:write.public&user_scope=',
              )
            }
          />
        )
      }
    />
  );
}

export default SlackButton;
