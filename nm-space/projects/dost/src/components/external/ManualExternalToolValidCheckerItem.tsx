import { CheckCircleIcon, QuestionIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Icon, Text, useColorMode, useToast } from '@chakra-ui/react';
import { stringify } from '@dogu-tech/common';
import { useState } from 'react';

import { ExternalKey, ExternalValidationResult } from '../../shares/external';
import { ipc } from '../../utils/window';
import BorderBox from '../layouts/BorderBox';
import ManualExternalToolDetail from './ManualExternalToolDetail';

interface Props {
  externalKey: ExternalKey;
  name: string;
  isValid: boolean;
  onValidateEnd?: (isValid: boolean) => Promise<void> | void;
}

const ManualExternalToolValidCheckerItem = ({ externalKey, name, isValid, onValidateEnd }: Props) => {
  const [valid, setValid] = useState<boolean>(isValid);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { colorMode } = useColorMode();

  const handleValidate = async () => {
    setLoading(true);
    try {
      console.log(`validate ${externalKey}`);
      const result = await ipc.externalClient.validate(externalKey);
      console.log(`validate result`, result);
      if (!result.valid) {
        toast({
          title: `Failed to validate ${externalKey}`,
          description: result.error?.message ?? 'Unknown error',
          status: 'error',
        });
      }
      setValid(result.valid);
      onValidateEnd?.(isValid);
    } catch (e) {
      ipc.rendererLogger.error(`Failed to validate ${externalKey}: ${stringify(e)}`);
    }
    setLoading(false);
  };

  return (
    <div>
      <BorderBox>
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <Text fontWeight="medium" fontSize="sm" mb="8px">
            {name}
          </Text>
          {valid ? <Icon as={CheckCircleIcon} color="green.500" /> : <Icon as={QuestionIcon} color="red.500" />}
        </Flex>
        <div>
          <div>{ManualExternalToolDetail({ externalKey })?.description?.()}</div>
          <div>{!valid && ManualExternalToolDetail({ externalKey })?.solution?.()}</div>
          {!valid && (
            <Button mt={2} size="sm" onClick={handleValidate} isLoading={loading}>
              Check
            </Button>
          )}
        </div>
      </BorderBox>
    </div>
  );
};

export default ManualExternalToolValidCheckerItem;
