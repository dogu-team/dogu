import { Button, useDisclosure } from '@chakra-ui/react';
import useEnvironmentStore from '../stores/environment';

import DevDrawer from './overlays/DevDrawer';

const DevButton = () => {
  const isDev = useEnvironmentStore((state) => state.isDev);
  const { isOpen: isDevDrawerOpen, onOpen: onDevDrawerOpen, onClose: onDevDrawerClose } = useDisclosure();

  if (!isDev) {
    return null;
  }

  return (
    <>
      <Button w="40px" h="20px" colorScheme="green" onClick={() => onDevDrawerOpen()}>
        Dev
      </Button>
      <DevDrawer isOpen={isDevDrawerOpen} onOpen={onDevDrawerOpen} onClose={onDevDrawerClose} />
    </>
  );
};

export default DevButton;
