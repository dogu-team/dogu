import { Button, Checkbox, Flex, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, UnorderedList } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useEnvironmentStore from '../../stores/environment';
import { ipc } from '../../utils/window';
import BorderBox from '../layouts/BorderBox';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NetworkSetupModal(props: Props) {
  const { isOpen, onClose } = props;

  const { features } = useEnvironmentStore();
  const [isTLSAuthRej, setTLSAuthRej] = useState<boolean>(false);

  const onTLSAuthChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chkboxIsRejected = e.target.checked ? true : false;
    const tlsRejectValue = chkboxIsRejected ? '0' : '1';
    await ipc.settingsClient.changeStrictSSLOnNPMLikes(chkboxIsRejected ? false : true);
    await ipc.dotEnvConfigClient.set('NODE_TLS_REJECT_UNAUTHORIZED', tlsRejectValue);

    const isRejected = (await ipc.dotEnvConfigClient.get('NODE_TLS_REJECT_UNAUTHORIZED')) === '0' ? true : false;
    setTLSAuthRej(isRejected);
  };

  useEffect(() => {
    (async () => {
      const isRejected = (await ipc.dotEnvConfigClient.get('NODE_TLS_REJECT_UNAUTHORIZED')) === '0' ? true : false;
      setTLSAuthRej(isRejected);
    })();
  }, [onTLSAuthChanged]);
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Network</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {features.useTLSAuthReject && (
              <BorderBox
                children={
                  <div>
                    <Flex justifyContent="space-between" alignItems="center" mb={2}>
                      <Flex alignItems="center" mb="8px">
                        <Text fontWeight="medium" fontSize="m">
                          TLS authentication
                        </Text>
                      </Flex>
                    </Flex>
                    <UnorderedList width="100%">
                      <ListItem>
                        <Text>
                          Are you using a Proxy or VPN? This can cause TLS authentication to fail. In that case, you can turn off TLS authentication, but you can download unsafe
                          data.
                        </Text>
                        <Checkbox mt="2" colorScheme="red" isChecked={isTLSAuthRej} onChange={onTLSAuthChanged}>
                          I understand the risks and want to turn off TLS authentication.
                        </Checkbox>
                      </ListItem>
                    </UnorderedList>
                  </div>
                }
              ></BorderBox>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
