import { CheckCircleIcon, QuestionIcon } from '@chakra-ui/icons';
import { Checkbox, HStack, Icon, Input, Td, Text, Tooltip, Tr } from '@chakra-ui/react';
import React from 'react';

import { DotEnvConfigKey } from '../../shares/dot-env-config';
import { ExternalKey } from '../../shares/external';

interface Props {
  isChecked: boolean;
  toolKey: ExternalKey;
  name: string;
  envs: { key: DotEnvConfigKey; value: string }[];
  isValid: boolean;
  errorMessage?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, key: ExternalKey) => void | Promise<void>;
}

const ExternalToolCheckboxItem = ({ isChecked, toolKey, name, envs, isValid, onChange, errorMessage }: Props) => {
  return (
    <Tr>
      <Td>
        <Checkbox isDisabled={isValid} checked={isChecked} onChange={(e) => onChange(e, toolKey)} />
      </Td>

      <Td>
        <Text>{name}</Text>
      </Td>

      {envs.length > 0 ? (
        envs.map((env) => (
          <React.Fragment key={env.key}>
            <Td>
              <Text>{env.key}</Text>
            </Td>
            <Td>
              <Tooltip hasArrow label={env.value} bg="white" color="gray.500">
                <Input minWidth="100px" value={env.value} color={isValid ? 'gray.500' : 'white.500'} readOnly={isValid} onChange={() => {}} />
              </Tooltip>
            </Td>
          </React.Fragment>
        ))
      ) : (
        <>
          <Td></Td>
          <Td></Td>
        </>
      )}

      <Td>
        <HStack>
          {isValid ? (
            <Icon as={CheckCircleIcon} color="green.500" />
          ) : (
            <Tooltip hasArrow label={errorMessage} bg="white">
              <Icon as={QuestionIcon} color="red.500" />
            </Tooltip>
          )}
        </HStack>
      </Td>
    </Tr>
  );
};

export default React.memo(ExternalToolCheckboxItem);
