import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogHeader, AlertDialogOverlay, Button, Text, AlertDialogCloseButton, Flex, Spacer } from '@chakra-ui/react';
import React from 'react';
import { ipc } from '../../utils/window';
import BorderBox from '../layouts/BorderBox';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function RestartAlert(props: Props) {
  const { isOpen, onClose } = props;
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const onCloseAlert = () => {
    onClose();
  };

  const onRestartClicked = async () => {
    await ipc.settingsClient.restart();
  };

  return (
    <AlertDialog isOpen={isOpen} onClose={onCloseAlert} leastDestructiveRef={cancelRef} isCentered closeOnEsc={false} closeOnOverlayClick={false}>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>Configuration changed</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          <BorderBox>
            <Text>These settings will not be reflected until you restart. Are you want to restart now?</Text>
            <Flex alignItems="center">
              <Spacer />
              <Button size="sm" onClick={() => onRestartClicked()} colorScheme="red">
                Restart
              </Button>
            </Flex>
          </BorderBox>
        </AlertDialogBody>
      </AlertDialogContent>
    </AlertDialog>
  );
}
