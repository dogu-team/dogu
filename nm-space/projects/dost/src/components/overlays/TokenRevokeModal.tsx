
export interface TokenRevokeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function TokenRevokeModal(props: TokenRevokeModalProps) {
  return <div />;
  //   return (
  //     <Modal isOpen={props.isOpen} onClose={props.onClose}>
  //       <ModalOverlay />
  //       <ModalContent>
  //         <ModalHeader>Please enter a new token</ModalHeader>
  //         <ModalCloseButton size="sm" />
  //         <ModalBody>
  //           <TokenInput onPass={props.onClose} />
  //         </ModalBody>
  //         <ModalFooter></ModalFooter>
  //       </ModalContent>
  //     </Modal>
  //   );
}

export default TokenRevokeModal;
