import { AppstoreOutlined, CloseOutlined } from '@ant-design/icons';
import { OrganizationId, Platform, PlatformType, ProjectId } from '@dogu-private/types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useSelect from '../../../../hooks/useSelect';

import { flexRowBaseStyle, flexRowCenteredStyle } from '../../../../styles/box';
import PlatformIcon from '../../../device/PlatformIcon';
import ProjectApplicationSelector from '../../../project-application/ProjectApplicationSelector';

interface Props {
  version: string | undefined;
  platform: PlatformType;
  onReset: (platform: PlatformType) => void;
  onChange: (platform: PlatformType, version: string | undefined) => void;
}

const PlatformAppVersionSelector = ({ version, platform, onReset, onChange }: Props) => {
  const router = useRouter();
  const { isOpen, toggle, close } = useSelect();

  const getExtension = () => {
    switch (platform) {
      case 'android':
        return 'apk';
      case 'ios':
        return 'ipa';
      default:
        return undefined;
    }
  };

  return (
    <AppSelectPlatformWrapper key={platform}>
      <PlatformName>
        <PlatformIcon platform={platform === 'android' ? Platform.PLATFORM_ANDROID : Platform.PLATFORM_IOS} />
        :&nbsp;
      </PlatformName>
      {version ? (
        <span>
          {version}
          <CloseButton onClick={() => onReset(platform)}>
            <CloseOutlined />
          </CloseButton>
        </span>
      ) : (
        <div style={{ width: '200px' }}>
          <ProjectApplicationSelector
            organizationId={router.query.orgId as OrganizationId}
            projectId={router.query.pid as ProjectId}
            onSelectApp={(app) => onChange(platform, app?.version)}
            placeholder="Select app"
            extension={getExtension()}
            open={isOpen}
            toggleOpen={toggle}
            close={close}
            selectedApplication={undefined}
            notFoundContent={
              <EmptyBox>
                <AppstoreOutlined style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                <EmptyText>
                  No applicaiton.
                  <br />
                  Please upload your app from <Link href={`/dashboard/${router.query.orgId}/projects/${router.query.pid}/apps`}>app menu</Link>.
                </EmptyText>
              </EmptyBox>
            }
          />
        </div>
      )}
    </AppSelectPlatformWrapper>
  );
};

export default PlatformAppVersionSelector;

const AppSelectPlatformWrapper = styled.div`
  ${flexRowBaseStyle}
  margin: .25rem 0;
`;

const CloseButton = styled.button`
  padding: 0.25rem;
  margin-left: 0.25rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
`;

const PlatformName = styled.div`
  ${flexRowBaseStyle}
  margin-right: 0.5rem;
`;

const EmptyBox = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
`;

const EmptyText = styled.p`
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.5;
`;
