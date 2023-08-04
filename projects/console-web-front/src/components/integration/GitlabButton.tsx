import GitlabIcon from 'public/resources/icons/gitlab.svg';
import IntegrationButton from './IntegrationButton';

interface Props {}

function GitlabButton(props: Props) {
  return (
    <IntegrationButton
      icon={<GitlabIcon style={{ width: '24px', height: '24px' }} />}
      name="Gitlab"
      description="Integrate routine with Gitlab"
      href="https://slack.com/oauth/v2/authorize?client_id=2910592940257.5689283091841&scope=chat:write,chat:write.public&user_scope="
    />
  );
}

export default GitlabButton;
