import { CopyIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  Code,
  IconButton,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Serial } from '@dogu-private/types';
import React, { useEffect, useState } from 'react';
import { ipc } from '../../utils/window';

interface Props {
  serial: Serial;
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceTokenAlert(props: Props) {
  const { isOpen, onClose } = props;
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const onClipboardCopy = () => {
    const text = `DOGU_DEVICE_SERIAL=${props.serial}\nDOGU_DEVICE_TOKEN=${token}`;
    ipc.settingsClient.writeTextToClipboard(text);
    toast.closeAll();
    toast({
      title: 'Clipboard',
      description: `Copied environment variables to clipboard`,
      status: 'success',
      duration: 1000,
      isClosable: true,
    });
  };

  const onCloseAlert = () => {
    setError('');
    onClose();
  };

  useEffect(() => {
    (async () => {
      ipc.deviceLookupClient
        .generateDeviceToken(props.serial)
        .then((token) => {
          setToken(token);
        })
        .catch((e) => {
          setError(e.message);
        });
    })();
  }, [isOpen]);

  return (
    <AlertDialog isOpen={isOpen} onClose={onCloseAlert} size="md" leastDestructiveRef={cancelRef} isCentered closeOnEsc={false} closeOnOverlayClick={false}>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>Test the routine locally using the environment variables below.</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          <Code overflowX="scroll" whiteSpace="nowrap" w="100%" fontSize="xs" p="10px" userSelect="text" onClick={() => onClipboardCopy()}>
            {`DOGU_DEVICE_SERIAL=${props.serial}`}
            <br />
            {`DOGU_DEVICE_TOKEN=${token}`}
          </Code>
        </AlertDialogBody>
      </AlertDialogContent>
    </AlertDialog>
  );
}
