import { Button, Center, Flex, Heading, List, Spacer, Text } from '@chakra-ui/react';
import { logger } from '../utils/logger';
import MacOsPermissions from './MacOSPermissions';

interface PermissionsProps {
  onNext: () => void;
}

function Permissions(props: PermissionsProps) {
  logger.verbose('Permission');

  return (
    <>
      <Flex w="100%" h="100%" direction={['column']} alignItems="center" gap="2">
        <Spacer />
        <Heading size="md" h="10%" p="2">
          Required Permissions
        </Heading>
        <Text align="center" m="7" fontSize="md">
          The following permissions are required to fully use Dost's functions.
        </Text>
        <Center flex="1" p="1">
          <List>
            <MacOsPermissions />
          </List>
        </Center>
        <Spacer />
        <Flex flexDirection="row" p="3" w="100%">
          <Spacer width="100%" />
          <Button size="sm" m="1" onClick={props.onNext}>
            Next
          </Button>
        </Flex>
      </Flex>
    </>
  );
}

export default Permissions;
