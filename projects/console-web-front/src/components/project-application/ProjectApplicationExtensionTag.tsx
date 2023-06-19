import { Tag } from 'antd';

interface Props {
  extension: string;
}

const ProjectApplicationExtensionTag = ({ extension }: Props) => {
  switch (extension) {
    case 'apk':
      return <Tag color="green">APK</Tag>;
    case 'ipa':
      return <Tag color="blue">IPA</Tag>;
    case 'exe':
      return <Tag color="purple">EXE</Tag>;
    default:
      return <Tag style={{ textTransform: 'uppercase' }}>{extension}</Tag>;
  }
};

export default ProjectApplicationExtensionTag;
