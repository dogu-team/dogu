import { CloseButton, Flex, Text } from '@chakra-ui/react';
import { IoMdHelpCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { ipc } from '../../utils/window';
import HeaderIconMenuButon from './HeaderIconMenuButon';

interface Props {
  title: string;
  subTitle?: string;
  closable?: boolean;
  docsLink?: string;
  sideContent?: React.ReactNode;
}

const PageTitle = ({ title, subTitle, closable, docsLink, sideContent }: Props) => {
  const navigate = useNavigate();
  const openDocs = async () => {
    if (!docsLink) return;
    await ipc.settingsClient.openExternal(docsLink);
  };

  return (
    <Flex direction="row" justifyContent="space-between" alignItems="center">
      <div>
        <Text fontSize="2xl" fontWeight="bold">
          {title}
        </Text>
        {!!subTitle && <Text mt="2">{subTitle}</Text>}
      </div>
      {!!sideContent && <div>{sideContent}</div>}
      {docsLink && <HeaderIconMenuButon icon={<IoMdHelpCircle style={{ fontSize: '18px' }} />} onClick={openDocs} />}
      {closable && <CloseButton onClick={() => navigate(-1)} />}
    </Flex>
  );
};

export default PageTitle;
