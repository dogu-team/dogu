import { ProjectApplicationWithIcon } from '@dogu-private/console';
import styled from 'styled-components';
import Image from 'next/image';

import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import ProjectApplicationExtensionTag from './ProjectApplicationExtensionTag';
import ProjectApplicationLatestTag from './ProjectApplicationLatestTag';

interface Props {
  app: ProjectApplicationWithIcon;
}

const ProjectApplicationOptionItem = ({ app }: Props) => {
  return (
    <FlexRowSpaceBetweenBox>
      <FlexRowBox style={{ marginRight: '.5rem' }}>
        <Image src={app.iconUrl} width={20} height={20} alt={app.name} style={{ marginRight: '.5rem' }} />
        &nbsp;{app.version}
        {app.isLatest === 1 && <ProjectApplicationLatestTag />}
      </FlexRowBox>
      <ProjectApplicationExtensionTag extension={app.fileName.slice(app.fileName.lastIndexOf('.') + 1)} />
    </FlexRowSpaceBetweenBox>
  );
};

export default ProjectApplicationOptionItem;

const FlexRowBox = styled.div`
  ${flexRowBaseStyle}
`;

const FlexRowSpaceBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
