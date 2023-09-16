import { RemoteBase } from '@dogu-private/console';
import { CREATOR_TYPE } from '@dogu-private/types';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../styles/box';

import ProfileImage from '../ProfileImage';
import ProfileImageWithName from '../users/ProfileImageWithName';

interface Props {
  remote: RemoteBase;
}

const RemoteCreator = ({ remote }: Props) => {
  switch (remote.creatorType) {
    case CREATOR_TYPE.ORGANIZATION:
      return <div>Organization</div>;
    case CREATOR_TYPE.PROJECT:
      return <div>Project</div>;
    case CREATOR_TYPE.USER:
      if (!remote.creator) {
        return <div>Unknown</div>;
      }
      return (
        <FlexRow>
          <ProfileImage
            profileImageUrl={remote.creator.profileImageUrl}
            name={remote.creator.name}
            size={20}
            style={{ fontSize: '.7rem' }}
          />
          <p style={{ marginLeft: '.25rem' }}>{remote.creator.name}</p>
        </FlexRow>
      );
    default:
      return <div>Unknown</div>;
  }
};

export default RemoteCreator;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
