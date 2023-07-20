import { RemoteBase } from '@dogu-private/console';
import { CREATOR_TYPE } from '@dogu-private/types';

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
        <ProfileImageWithName profileImage={<ProfileImage profileImageUrl={remote.creator.profileImageUrl} name={remote.creator.name} size={14} />} name={remote.creator.name} />
      );
    default:
      return <div>Unknown</div>;
  }
};

export default RemoteCreator;
