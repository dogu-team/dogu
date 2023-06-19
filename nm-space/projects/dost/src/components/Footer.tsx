import { ArrowRightIcon, CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  CircularProgress,
  Container,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Stack,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { delay } from '@dogu-tech/common';

import { logger } from '../utils/logger';
import { prettifyErrorString } from '../utils/prettify';
import { ipc, offFocus, onFocus } from '../utils/window';

interface VersionUIProps {
  tooltipLabel: string;
  popoverLabel: string;
  icon: ReactElement;
  onClick: () => void;
}

const defaultVersionUIProps: VersionUIProps = {
  tooltipLabel: 'Checking for updates...',
  popoverLabel: '',
  icon: <CircularProgress isIndeterminate thickness="5px" size="10px" />,
  onClick: () => {},
};

function Footer() {
  const { colorMode } = useColorMode();
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [versionUIProp, setVersionUIProp] = useState<VersionUIProps>(defaultVersionUIProps);
  const [platform, setPlatform] = useState<string | null>(null);
  const { isOpen: isUpdatePopOverOpen, onOpen: onUpdatePopOverOpen, onClose: onUpdatePopOverClose } = useDisclosure();
  const { isOpen: isUpdateConfirmOpen, onOpen: onUpdateConfirmOpen, onClose: onUpdateConfirmClose } = useDisclosure();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const hasPopOver = versionUIProp.popoverLabel !== '';

  const updateVersionUIProp = (newVersionUIProp: VersionUIProps) => {
    setVersionUIProp(newVersionUIProp);
    if (newVersionUIProp.popoverLabel !== '') {
      onUpdatePopOverOpen();
    } else {
      onUpdatePopOverClose();
    }
  };

  const onCheckForUpdatesClicked = useCallback(async () => {
    const appVersion = await ipc.updaterClient.getAppVersion();
    setAppVersion(appVersion);

    updateVersionUIProp(defaultVersionUIProps);
    const checkUpdateRet = await ipc.updaterClient.checkForUpdates();
    await delay(300);
    if (0 < checkUpdateRet.error.length) {
      updateVersionUIProp({
        tooltipLabel: `Check for updates failed: ${prettifyErrorString(checkUpdateRet.error)}...`,
        popoverLabel: '',
        icon: <WarningTwoIcon w={3} h={3} />,
        onClick: () => {
          onCheckForUpdatesClicked();
        },
      });
      return;
    }
    setLatestVersion(checkUpdateRet.lastestVersion);
    if (checkUpdateRet.lastestVersion === appVersion) {
      updateVersionUIProp({
        tooltipLabel: 'Up to date. Click to check again.',
        popoverLabel: '',
        icon: <CheckCircleIcon w={3} h={3} />,
        onClick: () => {
          onCheckForUpdatesClicked();
        },
      });
      return;
    }
    ipc.settingsClient.setBadgeCount(1);
    updateVersionUIProp({
      tooltipLabel: '',
      popoverLabel: `New version available: ${checkUpdateRet.lastestVersion}. Click here`,
      icon: <ArrowRightIcon w={3} h={3} />,
      onClick: () => {
        onUpdateConfirmOpen();
      },
    });
    return;
  }, [onUpdateConfirmOpen]);

  const onUpdateClicked = useCallback(async () => {
    if (latestVersion === null) {
      return;
    }
    setIsUpdating(true);
    const updateRet = await ipc.updaterClient.downloadAndInstallUpdate();
    setIsUpdating(false);
    logger.verbose(`updateRet ${updateRet}`);
    if (0 < updateRet.error.length) {
      const current = toast({
        title: 'Error',
        description: prettifyErrorString(updateRet.error),
        status: 'error',
        isClosable: true,
        position: 'top',
      });
      setTimeout(() => {
        toast.close(current);
      }, 3000);
      return;
    }
  }, [latestVersion, toast]);

  useEffect(() => {
    (async () => {
      const platform = await ipc.settingsClient.getPlatform();
      setPlatform(platform);

      await onCheckForUpdatesClicked();
    })();
  }, [onCheckForUpdatesClicked]);

  useEffect(() => {
    onFocus(onCheckForUpdatesClicked);
    return () => {
      offFocus(onCheckForUpdatesClicked);
    };
  }, []);

  const updateBox = (
    <Box>
      <Stack direction={['row']} alignItems="center" onClick={versionUIProp.onClick}>
        <Text width="90%" align="right" fontSize="xs">
          {appVersion}
        </Text>
        {versionUIProp.icon}
      </Stack>
    </Box>
  );

  return (
    <Container as="footer" role="contentinfo" py={{ base: '2' }} background={colorMode === 'dark' ? 'gray.900' : 'gray.100'} verticalAlign="bottom">
      <Flex direction={['row']}>
        <Spacer />
        {hasPopOver ? (
          <Popover
            returnFocusOnClose={false}
            isOpen={isUpdatePopOverOpen}
            onClose={onUpdatePopOverClose}
            placement="top"
            defaultIsOpen={true}
            closeOnBlur={false}
            closeOnEsc={false}
          >
            <PopoverTrigger>{updateBox}</PopoverTrigger>
            <PopoverContent bg="tomato" color="white">
              <PopoverArrow bg="tomato" />
              <PopoverBody onClick={versionUIProp.onClick}>
                <Text width="100%" align="center">
                  {versionUIProp.popoverLabel}
                </Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        ) : (
          <Tooltip placement="top-start" label={versionUIProp.tooltipLabel}>
            {updateBox}
          </Tooltip>
        )}
      </Flex>
      <AlertDialog isOpen={isUpdateConfirmOpen} leastDestructiveRef={cancelRef} onClose={onUpdateConfirmClose} isCentered closeOnEsc={false}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {`Are you want to update to ${latestVersion}?`}
            </AlertDialogHeader>

            {platform === 'darwin' ? (
              <AlertDialogBody>When the window is closed, the latest version of the app is automatically launched after a certain period of time.</AlertDialogBody>
            ) : (
              <></>
            )}

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  onUpdatePopOverOpen();
                  onUpdateConfirmClose();
                }}
                isDisabled={isUpdating}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onUpdateClicked} ml={3} isDisabled={isUpdating} isLoading={isUpdating}>
                Update
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}

export default Footer;
