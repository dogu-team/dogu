import { Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { useCallback } from 'react';
import ExternalCommandInstaller, { ExternalCommandKeyAndName } from './ExternalCommandInstaller';

interface Props {
  externalKeyAndNames: ExternalCommandKeyAndName[];
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

const ExternalCommandInstallerModal = ({ externalKeyAndNames, isOpen, onClose, onFinish }: Props) => {
  const handleFinsish = useCallback(() => {
    onFinish?.();
    onClose();
  }, [onClose, onFinish]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Running commands...</ModalHeader>
        <ModalBody>
          <ExternalCommandInstaller externalKeyAndNames={externalKeyAndNames} onStart={() => {}} onFinish={handleFinsish} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ExternalCommandInstallerModal;
