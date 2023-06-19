import { ProjectOutlined, TagsOutlined } from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { listActiveNameStyle } from '../../styles/text';

interface Props {
  tagCount?: number;
  projectCount?: number;
  onTagClick?: () => void;
  onProjectClick?: () => void;
}

const DeviceTagAndProject = ({ tagCount, projectCount, onTagClick, onProjectClick }: Props) => {
  return (
    <Box>
      {tagCount !== undefined && (
        <StyledButton onClick={onTagClick}>
          <TagsOutlined />
          <ButtonText>{tagCount}</ButtonText>
        </StyledButton>
      )}
      {projectCount !== undefined && (
        <StyledButton onClick={onProjectClick}>
          <ProjectOutlined />
          <ButtonText>{projectCount}</ButtonText>
        </StyledButton>
      )}
    </Box>
  );
};

export default React.memo(DeviceTagAndProject);

const Box = styled.div``;

const ButtonText = styled.p`
  ${listActiveNameStyle}
  margin-left: 0.25rem;
`;

const StyledButton = styled.button`
  ${flexRowBaseStyle}
  background-color: #fff;
  padding: 4px;

  &:hover ${ButtonText} {
    text-decoration: underline;
  }
`;
