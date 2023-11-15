import Image from 'next/image';
import styled from 'styled-components';

interface Props {
  title: React.ReactNode;
  desc: React.ReactNode;
  hideAlert?: boolean;
}

const ErrorBox = ({ title, desc, hideAlert }: Props) => {
  return (
    <Box>
      <div>
        <Image src="/resources/icons/dogu-community.png" alt="Error!" width={128} height={128} unoptimized />
      </div>
      <Title>{title}</Title>
      <Description>{desc}</Description>
      {!hideAlert && (
        <Alert>
          If this error persists, please{' '}
          <a href="https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw">
            join and get help in Slack Community
          </a>
          {process.env.NEXT_PUBLIC_ENV === 'self-hosted' && (
            <>
              {' '}
              or{' '}
              <a href="https://github.com/dogu-team/dogu-self-hosted/issues" target="_blank">
                report issue in GitHub
              </a>
            </>
          )}
          .
        </Alert>
      )}
    </Box>
  );
};

export default ErrorBox;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h2`
  margin-top: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.5;
`;

const Description = styled.div`
  margin-top: 1.5rem;
  line-height: 1.5;
  text-align: center;
`;

const Alert = styled.p`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: ${(props) => props.theme.main.colors.gray3};
  text-align: center;
`;
