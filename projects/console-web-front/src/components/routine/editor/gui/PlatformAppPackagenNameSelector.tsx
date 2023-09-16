import { OrganizationId, Platform, PlatformType, ProjectId } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import useSelect from '../../../../hooks/useSelect';
import { flexRowBaseStyle } from '../../../../styles/box';
import PlatformIcon from '../../../device/PlatformIcon';
import ProjectApplicationSelector from '../../../project-application/ProjectApplicationSelector';

interface Props {
  packageName: string | undefined;
  platform: PlatformType;
  onReset: (platform: PlatformType) => void;
  onChange: (platform: PlatformType, packageName: string | undefined) => void;
}

const PlatformAppPcakageNameSelector = ({ packageName, platform, onReset, onChange }: Props) => {
  const router = useRouter();
  const { isOpen, toggle, close } = useSelect();
  const { t } = useTranslation();

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

      <div style={{ width: '200px' }}>
        <ProjectApplicationSelector
          defaultValue={packageName}
          value={packageName}
          organizationId={router.query.orgId as OrganizationId}
          projectId={router.query.pid as ProjectId}
          onSelectApp={(packageName, app) => onChange(platform, packageName)}
          placeholder="Select app"
          extension={getExtension()}
          open={isOpen}
          toggleOpen={toggle}
          close={close}
          selectedApplication={undefined}
        />
      </div>
    </AppSelectPlatformWrapper>
  );
};

export default PlatformAppPcakageNameSelector;

const AppSelectPlatformWrapper = styled.div`
  ${flexRowBaseStyle}
  margin: .25rem 0;
`;

const PlatformName = styled.div`
  ${flexRowBaseStyle}
  margin-right: 0.5rem;
`;

const LatestDescription = styled.p`
  font-size: 0.8rem;
  color: #999;
  line-height: 1.5;
  margin-top: 0.25rem;
  white-space: pre-wrap;
`;
