import { DeviceTagBase } from '@dogu-private/console';
import { Tag } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

interface Props {
  tags: DeviceTagBase[];
}

const DeviceTagContainer = ({ tags }: Props) => {
  const [seeMore, setSeeMore] = useState(false);

  const data = seeMore ? tags : tags.slice(0, 5);

  return (
    <>
      {data.map((item) => (
        <StyledTag key={`device-tag-${item.deviceTagId}`}>{item.name}</StyledTag>
      ))}
      {tags.length > 5 && <TextButton onClick={() => setSeeMore((prev) => !prev)}>{seeMore ? 'hide' : 'see more'}</TextButton>}
    </>
  );
};

export default DeviceTagContainer;

const StyledTag = styled(Tag)`
  margin: 2px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TextButton = styled.button`
  background-color: inherit;
  padding: 0;
  margin: 0 8px 0 0;
  color: ${(props) => props.theme.colors.gray4};
  font-size: 0.85rem;
  font-weight: 300;
  text-decoration: underline;
`;
