import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { PlatformType } from '@dogu-private/types';
import { BsAndroid, BsApple, BsPlaystation, BsWindows, BsXbox } from 'react-icons/bs';

interface Props {
  platform: PlatformType;
}

const DevicePlatformIcon = ({ platform }: Props) => {
  switch (platform) {
    case 'android':
      return <BsAndroid style={{ color: '#3ddc84' }} />;
    case 'ios':
      return <BsApple style={{ color: '#A3AAAE' }} />;
    case 'windows':
      return <BsWindows style={{ color: '#699BF7' }} />;
    case 'macos':
      return <BsApple style={{ color: '#000' }} />;
    case 'ps4':
      return <BsPlaystation />;
    case 'xbox':
      return <BsXbox style={{ color: '#107C10' }} />;
    default:
      return <QuestionOutlineIcon />;
  }
};

export default DevicePlatformIcon;
