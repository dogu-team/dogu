import { Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { useCallback } from 'react';

import ExternaltoolInstaller, { ExternalKeyAndName } from './ExternalToolInstaller';

interface Props {
  externalKeyAndNames: ExternalKeyAndName[];
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

const ExternalToolInstallerModal = ({ externalKeyAndNames, isOpen, onClose, onFinish }: Props) => {
  const handleFinsish = useCallback(() => {
    onFinish?.();
    onClose();
  }, [onClose, onFinish]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Installing packages...</ModalHeader>
        <ModalBody>
          <ExternaltoolInstaller externalKeyAndNames={externalKeyAndNames} onStart={() => {}} onFinish={handleFinsish} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ExternalToolInstallerModal;
