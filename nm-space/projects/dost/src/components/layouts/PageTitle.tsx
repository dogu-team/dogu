import { CloseButton, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  subTitle?: string;
  closable?: boolean;
}

const PageTitle = ({ title, subTitle, closable }: Props) => {
  const navigate = useNavigate();

  return (
    <Flex direction="row" justifyContent="space-between" alignItems="center">
      <div>
        <Text fontSize="2xl" fontWeight="bold">
          {title}
        </Text>
        {!!subTitle && <Text mt="2">{subTitle}</Text>}
      </div>

      {closable && <CloseButton onClick={() => navigate(-1)} />}
    </Flex>
  );
};

export default PageTitle;
