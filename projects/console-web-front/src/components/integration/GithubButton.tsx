import GithubIcon from 'public/resources/icons/github.svg';
import IntegrationButton from './IntegrationButton';

interface Props {}

function GithubButton(props: Props) {
  return (
    <IntegrationButton
      icon={<GithubIcon style={{ width: '24px', height: '24px' }} />}
      name="Github"
      description="Integrate routine with Github"
      href="https://slack.com/oauth/v2/authorize?client_id=2910592940257.5689283091841&scope=chat:write,chat:write.public&user_scope="
    />
  );
}

export default GithubButton;
