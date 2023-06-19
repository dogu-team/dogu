import { Button, Checkbox, Flex, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { useState } from 'react';

import { ExternalKey } from '../../shares/external';
import ExternalToolAgreementContent from './ExternalToolAgreementContent';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void | Promise<void>;
  externalKeys: ExternalKey[];
}

const ExternalToolAgreementModal = ({ externalKeys, isOpen, onClose, onAccept }: Props) => {
  const [checked, setChecked] = useState(false);

  const handleClose = () => {
    setChecked(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Third parties agreements</ModalHeader>
        <ModalBody>
          <ExternalToolAgreementContent externalKeys={externalKeys} />

          <Flex mt={6}>
            <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
              Agree to all
            </Checkbox>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={handleClose}>
            Close
          </Button>
          <Button colorScheme="blue" isDisabled={!checked} onClick={onAccept}>
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExternalToolAgreementModal;
