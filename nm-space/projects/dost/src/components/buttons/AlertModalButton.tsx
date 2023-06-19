import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

interface Props {
  buttonTitle: string;
  modalHeader: string;
  modalBody: React.ReactNode;
  needSubmitButton?: boolean;
  submitButtonTitle?: string;
  cancelButtonTitle?: string;
  onSubmit?: () => void | Promise<void>;
}

const AlertModalButton = ({ buttonTitle, modalHeader, modalBody, submitButtonTitle, needSubmitButton, cancelButtonTitle, onSubmit }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async () => {
    if (!onSubmit) {
      return;
    }

    setLoading(true);
    await onSubmit();
    setLoading(false);
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="red">
        {buttonTitle}
      </Button>

      <AlertDialog isOpen={isOpen} onClose={onClose} isCentered leastDestructiveRef={cancelRef}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>{modalHeader}</AlertDialogHeader>
            <AlertDialogCloseButton />

            <AlertDialogBody>{modalBody}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {cancelButtonTitle ?? 'Cancel'}
              </Button>
              {needSubmitButton && (
                <Button colorScheme="red" onClick={handleSubmit} ml={3} disabled={loading} isLoading={loading}>
                  {submitButtonTitle ?? 'Submit'}
                </Button>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default AlertModalButton;
