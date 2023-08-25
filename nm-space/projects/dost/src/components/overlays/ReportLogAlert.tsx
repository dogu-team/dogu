import { CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogHeader, AlertDialogOverlay, Button, Text, Stack, AlertDialogCloseButton, Code, Flex } from '@chakra-ui/react';
import { errorify } from '@dogu-tech/common';
import React from 'react';
import { useEffect, useState } from 'react';
import { BsSlack } from 'react-icons/bs';
import { DoguCommunityHelpChannel } from '../../shares/constants';
import { ipc } from '../../utils/window';
import BorderBox from '../layouts/BorderBox';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportLogAlert(props: Props) {
  const { isOpen, onClose } = props;
  const [createStatus, setCreateStatus] = useState<'idle' | 'inprogress' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const onCloseAlert = () => {
    setCreateStatus('idle');
    setError('');
    onClose();
  };

  const onClickDoguCommunityHelpChannel = async () => {
    await ipc.settingsClient.openExternal(DoguCommunityHelpChannel);
  };

  useEffect(() => {
    (async () => {
      if (!isOpen) return;
      if (createStatus !== 'idle') return;
      setCreateStatus('inprogress');
      try {
        await ipc.settingsClient.createZipLogReport();
        setCreateStatus('success');
      } catch (e) {
        setCreateStatus('error');
        const error = errorify(e);
        setError(error.message);
      }
    })();
  }, [isOpen, createStatus]);

  return (
    <AlertDialog isOpen={isOpen} onClose={onCloseAlert} size="xl" leastDestructiveRef={cancelRef} isCentered closeOnEsc={false} closeOnOverlayClick={false}>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>
          {createStatus === 'inprogress' && <Text>Creating report ...</Text>}
          {createStatus === 'error' && (
            <Flex align="center">
              <WarningTwoIcon color="red.500" />
              <Text>&nbsp;Failed to create report</Text>
            </Flex>
          )}
          {createStatus === 'success' && (
            <Flex align="center">
              <CheckCircleIcon color="green.500" />
              <Text>&nbsp;Report created successfully!</Text>
            </Flex>
          )}
        </AlertDialogHeader>
        {createStatus !== 'inprogress' && <AlertDialogCloseButton />}
        <AlertDialogBody>
          <BorderBox
            children={
              <div>
                {createStatus === 'error' && <Text>{error}</Text>}
                {createStatus === 'success' && (
                  <div>
                    <Text>
                      <Code>dogu-report.zip</Code> is the report file.
                    </Text>
                    <Text color="orange" mt={4}>
                      <WarningTwoIcon color="orange" />
                      &nbsp; The report file contains information such as environment variables, current PC's cpu, and memory. Please check if there is any information that should
                      not be disclosed.
                    </Text>
                    &nbsp;
                    <Text>
                      It would be appreciated if you forward the <Code>dogu-report.zip</Code> file to the Dogu Slack Community or{' '}
                      <a href="mailto:contact@dogutech.io" style={{ textDecoration: 'underline' }}>
                        contact@dogutech.io
                      </a>
                    </Text>
                    <Button size="sm" onClick={onClickDoguCommunityHelpChannel} mt="8px" leftIcon={<BsSlack />}>
                      Dogu Community 'help' channel
                    </Button>
                  </div>
                )}
              </div>
            }
          ></BorderBox>
        </AlertDialogBody>
      </AlertDialogContent>
    </AlertDialog>
  );
}
