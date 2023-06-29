import { ListItem, Stack, UnorderedList, useDisclosure, Text, Button } from '@chakra-ui/react';
import { useContext, useState } from 'react';

import { ExternalKeyAndName } from './ExternalToolInstaller';
import ExternalToolInstallerModal from './ExternalToolInstallerModal';
import { ValidContext } from './ManualExternalToolValidCheckerItem';

interface Props {
  projectName: string;
  onOpenProject: () => Promise<void>;
  externalKeyAndNames: ExternalKeyAndName[];
}

const XCodeProjectBuildDescription = ({ projectName, externalKeyAndNames, onOpenProject }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const { isValid, validate } = useContext(ValidContext);

  return (
    <div>
      <UnorderedList width="100%">
        <ListItem>
          <Stack spacing={1} direction="row" alignItems="center">
            <Button size="sm" onClick={onOpenProject}>
              Open {projectName} project
            </Button>
            <Text fontSize={'sm'}> and configure Signing & Capabilities</Text>
          </Stack>
        </ListItem>
        <ListItem mt="8px">
          <Button
            size="sm"
            onClick={() => {
              onOpen();
              setLoading(true);
            }}
            isLoading={loading}
            colorScheme="blue"
            isDisabled={isValid}
          >
            Click here to build
          </Button>
        </ListItem>
      </UnorderedList>
      <ExternalToolInstallerModal
        title={<Text>Building project...</Text>}
        isOpen={isOpen}
        onClose={onClose}
        onFinish={() => {
          setLoading(false);
          validate();
        }}
        externalKeyAndNames={externalKeyAndNames}
      />
    </div>
  );
};

export default XCodeProjectBuildDescription;
