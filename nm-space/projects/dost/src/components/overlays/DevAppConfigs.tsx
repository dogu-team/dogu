import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Switch,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ipc } from '../../utils/window';
import styled from 'styled-components';
import { AppConfigKey, AppConfigSchema } from '@dogu-private/dogu-agent-core/shares';
import { RestartAlert } from './RestartAlert';

interface DevAppConfigsProps {
  isOpen: boolean;
  onClose: () => void;
}

type AppConfigTypes = 'string' | 'number' | 'boolean';

interface ConfigAndValue {
  key: AppConfigKey;
  type: AppConfigTypes;
  value: any;
}

function DevAppConfigs(props: DevAppConfigsProps) {
  const { isOpen, onClose } = props;
  const [configs, setConfigs] = useState<ConfigAndValue[]>([]);
  const { isOpen: isRestartOpen, onOpen: onRestartOpen, onClose: onRestartClose } = useDisclosure();
  const toast = useToast();

  const setValue = async (config: ConfigAndValue, value: any) => {
    const newConfigs = configs.map((c) => {
      if (c.key === config.key) {
        if (c.type === 'number') {
          value = Number(value);
          if (isNaN(value)) value = c.value;
        } else if (c.type === 'boolean') value = Boolean(value);
        else if (c.type === 'string') value = String(value);
        return { ...c, value };
      }
      return c;
    });
    setConfigs(newConfigs);
  };

  const save = async () => {
    for (const config of configs) {
      if (config.value === undefined) {
        await ipc.appConfigClient.delete(config.key);
      } else {
        await ipc.appConfigClient.set(config.key, config.value);
      }
    }
    toast({
      title: 'Config Saved',
      description: '',
      status: 'success',
      position: 'bottom',
      duration: 2000,
    });
  };

  const reload = async () => {
    const keys = Object.keys(AppConfigSchema);
    const newConfigs: ConfigAndValue[] = [];
    for (const k of keys) {
      const key = k as AppConfigKey;
      const type = AppConfigSchema[key].type;
      switch (type) {
        case 'string':
          {
            const value = await ipc.appConfigClient.get<string>(key);
            newConfigs.push({ key, type, value });
          }
          break;
        case 'number':
          {
            const value = await ipc.appConfigClient.get<number>(key);
            newConfigs.push({ key, type, value });
          }
          break;
        case 'boolean':
          {
            const value = await ipc.appConfigClient.get<boolean>(key);
            newConfigs.push({ key, type, value });
          }
          break;
      }
    }
    setConfigs(newConfigs);
  };
  useEffect(() => {
    reload().catch((e) => console.error(e));
  }, []);

  return (
    <div>
      <Modal onClose={onClose} isOpen={isOpen} isCentered scrollBehavior="inside" size="full">
        <ModalOverlay />
        <ModalContent mt="80px">
          <ModalHeader>App Config</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              {configs.map((config) => {
                return (
                  <HStack key={`${config.key}-hstack`}>
                    <Text w="400px" overflow="clip" userSelect="text">
                      {config.key}
                    </Text>
                    <Box w="70%">
                      {config.type === 'boolean' && (
                        <Switch
                          id={`${config.key}-switch`}
                          isChecked={config.value === true}
                          background={config.value === undefined ? 'red' : 'transparent'}
                          onChange={(e) => setValue(config, e.target.checked)}
                        />
                      )}
                      {(config.type === 'string' || config.type === 'number') && (
                        <Input
                          key={`${config.key}-input`}
                          size="xs"
                          value={config.value}
                          placeholder={undefined === config.value ? 'undefined' : ''}
                          onChange={(e) => setValue(config, e.target.value)}
                        />
                      )}
                    </Box>
                  </HStack>
                );
              })}
              <Flex p="10px" gap="5px">
                <Spacer />
                <Button size="sm" onClick={reload}>
                  Reload
                </Button>
                <Button size="sm" onClick={save}>
                  Save
                </Button>
                <Button size="sm" onClick={onRestartOpen}>
                  Restart
                </Button>
              </Flex>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
      <RestartAlert isOpen={isRestartOpen} onClose={onRestartClose} />
    </div>
  );
}

export default DevAppConfigs;
