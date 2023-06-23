import { CloseIcon, SearchIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Modal, ModalBody, ModalContent, ModalHeader, Text, ModalOverlay, Spacer } from '@chakra-ui/react';
import { useCallback, useState } from 'react';

import ExternaltoolInstaller, { ExternalKeyAndName } from './ExternalToolInstaller';

interface Props {
  externalKeyAndNames: ExternalKeyAndName[];
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

const ExternalToolInstallerModal = ({ externalKeyAndNames, isOpen, onClose, onFinish }: Props) => {
  const [isOpenCloseBtn, setIsOpenCloseBtn] = useState(false);
  const handleFinsish = useCallback(
    (isOk: boolean) => {
      if (isOk) {
        onFinish?.();
        onClose();
      } else {
        setIsOpenCloseBtn(true);
      }
    },
    [onFinish],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Text>Installing packages...</Text>
            <Spacer />
            {isOpenCloseBtn ? (
              <IconButton
                size="xs"
                aria-label="close"
                icon={<CloseIcon />}
                onClick={() => {
                  setIsOpenCloseBtn(false);
                  onFinish?.();
                  onClose();
                }}
              />
            ) : null}
          </Flex>
        </ModalHeader>
        <ModalBody>
          <ExternaltoolInstaller externalKeyAndNames={externalKeyAndNames} onStart={() => {}} onFinish={handleFinsish} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ExternalToolInstallerModal;
