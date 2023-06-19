import { CheckCircleIcon, QuestionIcon } from '@chakra-ui/icons';
import { Button, Flex, Icon, Text } from '@chakra-ui/react';
import { stringify } from '@dogu-tech/common';
import { useState } from 'react';

import { ExternalKey, ExternalValidationResult } from '../../shares/external';
import { ipc } from '../../utils/window';

interface Props {
  externalKey: ExternalKey;
  name: string;
  solution: React.ReactNode;
  isValid: boolean;
  onValidateEnd?: (isValid: boolean) => Promise<void> | void;
}

const ManualExternalToolValidCheckerItem = ({ externalKey, name, isValid, solution, onValidateEnd }: Props) => {
  const [valid, setValid] = useState<boolean>(isValid);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const result = await ipc.externalClient.validate(externalKey);
      setValid(result.valid);
      onValidateEnd?.(isValid);
    } catch (e) {
      ipc.rendererLogger.error(`Failed to validate ${externalKey}: ${stringify(e)}`);
    }
    setLoading(false);
  };

  return (
    <div>
      <Text fontWeight="medium" fontSize="sm" mb="8px">
        {name}
      </Text>
      <div>
        <Flex alignItems="center" mb={2}>
          <Text mr="4px" fontSize="sm">
            Validation:
          </Text>
          {valid ? <Icon as={CheckCircleIcon} color="green.500" /> : <Icon as={QuestionIcon} color="red.500" />}
        </Flex>
        <div>{!valid && solution}</div>
        {!valid && (
          <Button mt={2} size="sm" onClick={handleValidate} isLoading={loading}>
            Check
          </Button>
        )}
      </div>
    </div>
  );
};

export default ManualExternalToolValidCheckerItem;
