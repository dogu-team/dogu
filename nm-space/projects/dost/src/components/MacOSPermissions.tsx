import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { Box, Button, ListItem, Spinner, Stack, Text, Tooltip, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ipc, offFocus, onFocus } from '../utils/window';

type PermissionStatus = 'granted' | 'denied' | 'checking';

function MacOsPermissions() {
  const [screenPermission, setScreenPermission] = useState<PermissionStatus>();
  const [accessibilityPermission, setAccessibilityPermission] = useState<PermissionStatus>();
  const toast = useToast();

  useEffect(() => {
    const reload = async () => {
      const screenStatus = await ipc.settingsClient.getMediaAccessStatus('screen');
      screenStatus === 'granted' ? setScreenPermission('granted') : setScreenPermission('denied');
      const isAccessibilityGranted = await ipc.settingsClient.isTrustedAccessibilityClient(false);
      isAccessibilityGranted ? setAccessibilityPermission('granted') : setAccessibilityPermission('denied');
    };
    reload();
    onFocus(reload);
    return () => {
      offFocus(reload);
    };
  }, []);

  const onScreenPermissionClicked = () => {
    (async () => {
      // if (screenPermission === 'granted') {
      //   return;
      // }
      setScreenPermission('checking');
      await ipc.settingsClient.requestDesktopCapture();
      await ipc.settingsClient.openSecurityPrefPanel('Privacy_ScreenCapture');
    })();
  };

  const onAccessibilityPermissionClicked = () => {
    (async () => {
      // if (accessibilityPermission === 'granted') {
      //   return;
      // }
      setAccessibilityPermission('checking');
      await ipc.settingsClient.isTrustedAccessibilityClient(true);
      await ipc.settingsClient.openSecurityPrefPanel('Privacy_Accessibility');
    })();
  };

  return (
    <Stack direction={['row']} spacing="10px">
      <Button
        size="sm"
        onClick={onScreenPermissionClicked}
        // leftIcon={
        //   screenPermission === 'granted' ? (
        //     <CheckCircleIcon color="green.500" />
        //   ) : screenPermission === 'denied' ? (
        //     <WarningIcon color="red.500" />
        //   ) : (
        //     <WarningIcon color="yellow.500" />
        //   )
        // }
      >
        {screenPermission === 'granted' ? (
          <CheckCircleIcon color="green.500" marginRight="1" />
        ) : screenPermission === 'denied' ? (
          <WarningIcon color="red.500" marginRight="1" />
        ) : (
          <Spinner size="sm" marginRight="1" />
        )}
        Screen
      </Button>
      <Button size="sm" onClick={onAccessibilityPermissionClicked}>
        {accessibilityPermission === 'granted' ? (
          <CheckCircleIcon color="green.500" marginRight="1" />
        ) : accessibilityPermission === 'denied' ? (
          <WarningIcon color="red.500" marginRight="1" />
        ) : (
          <Spinner size="sm" marginRight="1" />
        )}
        Accesibility
      </Button>
    </Stack>
  );
}

export default MacOsPermissions;
