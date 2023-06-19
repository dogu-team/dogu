import { Button } from '@chakra-ui/react';
import { ExternalKey } from '../../shares/external';
import { DoguDocsXcodeSettingsUrl } from '../../utils/constants';
import { ipc } from '../../utils/window';

interface Props {
  externalKey: ExternalKey;
}

const ManaulExternalToolSolution = ({ externalKey }: Props) => {
  switch (externalKey) {
    case 'xcode':
      return (
        <Button
          onClick={() => {
            ipc.settingsClient.openExternal(DoguDocsXcodeSettingsUrl);
          }}
        >
          Open XCode settings document
        </Button>
      );
    default:
      return null;
  }
};

export default ManaulExternalToolSolution;
