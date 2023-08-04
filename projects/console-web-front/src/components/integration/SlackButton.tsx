import SlackIcon from 'public/resources/icons/slack.svg';
import IntegrationButton from './IntegrationButton';

interface Props {}

function SlackButton(props: Props) {
  return (
    <IntegrationButton
      icon={<SlackIcon style={{ width: '24px', height: '24px' }} />}
      name="Slack"
      description="Send notifications to Slack"
      href="https://slack.com/oauth/v2/authorize?client_id=2910592940257.5689283091841&scope=chat:write,chat:write.public&user_scope="
    />
  );
}

export default SlackButton;
