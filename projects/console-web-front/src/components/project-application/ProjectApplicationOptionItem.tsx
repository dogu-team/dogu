import { ProjectApplicationWithIcon } from '@dogu-private/console';
import styled from 'styled-components';
import Image from 'next/image';

import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import ProjectApplicationExtensionTag from './ProjectApplicationExtensionTag';

interface Props {
  app: ProjectApplicationWithIcon;
}

const ProjectApplicationOptionItem = ({ app }: Props) => {
  return (
    <FlexRowSpaceBetweenBox>
      <FlexRowBox>
        <Image src={app.iconUrl} width={20} height={20} alt={app.name} />
        &nbsp;{app.version}
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
