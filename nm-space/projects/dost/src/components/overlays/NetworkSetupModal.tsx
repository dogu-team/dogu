import { Button, Checkbox, Flex, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, UnorderedList } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ipc } from '../../utils/window';
import BorderBox from '../layouts/BorderBox';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NetworkSetupModal(props: Props) {
  const { isOpen, onClose } = props;

  const [isTLSAuth, setTLSAuth] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const value = await ipc.dotEnvConfigClient.get('NODE_TLS_REJECT_UNAUTHORIZED');
      setTLSAuth(value === '0' ? false : true);
    })();
  }, []);
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Network</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <BorderBox
              children={
                <div>
                  <Flex justifyContent="space-between" alignItems="center" mb={2}>
                    <Flex alignItems="center" mb="8px">
                      <Text fontWeight="medium" fontSize="m">
                        TLS Authorization
                      </Text>
                    </Flex>
                  </Flex>
                  <UnorderedList width="100%">
                    <ListItem>
                      <Text>
                        Are you using a Proxy or VPN? This can cause TLS authentication to fail. In that case, you can turn off TLS authentication, but you can download unsafe
                        data.
                      </Text>
                      <Checkbox mt="2" colorScheme="green" isChecked={isTLSAuth}>
                        I understand the risks and want to turn off TLS authentication.
                      </Checkbox>
                    </ListItem>
                  </UnorderedList>
                </div>
              }
            ></BorderBox>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
