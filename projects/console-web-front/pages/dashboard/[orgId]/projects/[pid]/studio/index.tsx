import { GetServerSideProps, NextPage } from 'next';
import styled, { keyframes } from 'styled-components';
import { Chakra_Petch } from 'next/font/google';
import { OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { useRouter } from 'next/router';
import Image from 'next/image';

import StudioDeviceSelector from '../../../../../../src/components/studio/StudioDeviceSelector';
import { getOrganizationInServerSide } from '../../../../../../src/api/organization';
import { getProjectInServerSide } from '../../../../../../src/api/project';
import { getUserInServerSide } from '../../../../../../src/api/registery';
import Header from '../../../../../../src/components/layouts/Header';
import resources from '../../../../../../src/resources';
import { flexRowCenteredStyle } from '../../../../../../src/styles/box';
import Link from 'next/link';

const chakraPetch = Chakra_Petch({ subsets: ['latin'], weight: ['700'] });

interface StudioEntryServerSideProps {
  organization: OrganizationBase;
  project: ProjectBase;
  me: UserBase;
}

const StudioEntryPage: NextPage<StudioEntryServerSideProps> = ({ organization, project, me }) => {
  const router = useRouter();

  return (
    <Box>
      <Header
        image={
          <Image src={resources.icons.studioLogo} height={48} width={170} alt="Dogu Studio" unoptimized priority />
        }
      />
      <Centered>
        <ImageContent>
          <Image src={resources.icons.logo} width={96} height={96} alt="Dogu" />
        </ImageContent>
        <StyledH2 className={chakraPetch.className}>Dogu Studio</StyledH2>
        <FlexColCenter>
          <Description style={{ marginBottom: '1rem', fontWeight: '500' }}>
            Dogu studio is for manaul testing, UI inspector, device real-time streaming and remote controls
          </Description>
          <Description style={{ fontWeight: '300', fontSize: '.9rem', marginBottom: '1rem' }}>
            Select your device to continue
          </Description>
          <SelectWrapper>
            <StudioDeviceSelector
              selectedDevice={undefined}
              organizationId={organization.organizationId}
              projectId={project.projectId}
              onSelectedDeviceChanged={(device) => {
                if (device) {
                  router.push(
                    `/dashboard/${organization.organizationId}/projects/${project.projectId}/studio/${device.deviceId}/manual`,
                  );
                } else {
                  router.push(`/dashboard/${organization.organizationId}/projects/${project.projectId}/studio`);
                }
              }}
            />
          </SelectWrapper>
          <Link
            style={{ fontWeight: '300', fontSize: '.9rem', marginTop: '2rem' }}
            href={`/dashboard/${organization.organizationId}/device-farm/hosts`}
            target={'_blank'}
          >
            {`Isn't there a device available to select? Please assign a device to this project.`}
          </Link>
        </FlexColCenter>
      </Centered>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps<StudioEntryServerSideProps> = async (context) => {
  try {
    const [organization, project, user] = await Promise.all([
      getOrganizationInServerSide(context),
      getProjectInServerSide(context),
      getUserInServerSide(context),
    ]);

    return {
      props: {
        organization,
        project,
        me: user,
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
};

export default StudioEntryPage;

const Box = styled.div`
  width: 100dvw;
  height: 100dvh;
`;

const ImageContent = styled.div`
  margin-bottom: 0.5rem;
`;

const FlexColCenter = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
`;

const Centered = styled(FlexColCenter)`
  height: calc(100dvh - 57px);
`;

const shiningText = keyframes`
  0% {
      background-position: 0% 50%;
  }
  100% {
      background-position: 100% 50%;
  }
`;

const StyledH2 = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: 700;
  line-height: 1.5;
  background: linear-gradient(
    to right,
    #7953cd 20%,
    #00affa 30%,
    ${(props) => props.theme.colorPrimary} 70%,
    #764ada 80%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-fill-color: transparent;
  background-size: 500% auto;
  animation: ${shiningText} 5s ease-in-out infinite alternate;
`;

const Description = styled.p`
  line-height: 1.5;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const SelectWrapper = styled.div`
  width: 20rem;
`;
