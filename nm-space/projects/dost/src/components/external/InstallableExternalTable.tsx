import { Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react';
import { stringify } from '@dogu-tech/common';
import { ExternalToolInfo } from '../../hooks/platform-supported-external-info';

import { DotEnvConfigKey } from '../../shares/dot-env-config';
import { ExternalKey, ExternalValidationResult } from '../../shares/external';
import ExternalToolCheckboxItem from './ExternalToolCheckboxTableItem';

// type ExternalToolInfo = { key: ExternalKey; name: string; envs: { key: DotEnvConfigKey; value: string }[]; result: ExternalValidationResult };

interface Props {
  externalTools: ExternalToolInfo[];
  onToggleCheck: (e: React.ChangeEvent<HTMLInputElement>, key: ExternalKey) => void;
}

const InstallableExternalTable = ({ externalTools, onToggleCheck }: Props) => {
  const externalToolsForList = externalTools.filter((externalTool) => !externalTool.isManualInstallNeeded);

  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Install</Th>
            <Th>Name</Th>
            <Th>Key</Th>
            <Th>Value</Th>
            <Th>Validation</Th>
          </Tr>
        </Thead>
        <Tbody>
          {externalToolsForList.map((externalTool) => (
            <ExternalToolCheckboxItem
              key={externalTool.key}
              toolKey={externalTool.key}
              name={externalTool.name}
              envs={externalTool.envs}
              isValid={externalTool.result?.valid ?? false}
              errorMessage={stringify(externalTool.result?.error?.message) ?? 'Unknown error'}
              onChange={onToggleCheck}
            />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default InstallableExternalTable;
