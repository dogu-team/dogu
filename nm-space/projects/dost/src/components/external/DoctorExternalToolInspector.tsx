import { Button, Flex, useDisclosure } from '@chakra-ui/react';
import { ExternalKey } from '@dogu-private/dogu-agent-core/shares';
import { useCallback, useState } from 'react';
import { ExternalToolInfo } from '../../hooks/platform-supported-external-info';
import { ipc } from '../../utils/window';
import ExternalToolAgreementModal from './ExternalToolAgreementModal';
import ExternalToolInstallerModal from './ExternalToolInstallerModal';
import InstallableExternalTable from './InstallableExternalTable';

interface Props {
  externalTools: ExternalToolInfo[];
  onFinishInstall: () => void | Promise<void>;
}

const DoctorExternalToolInspector = ({ externalTools, onFinishInstall }: Props) => {
  const { isOpen: isAgreementOpen, onOpen: onAgreementOpen, onClose: onAgreementClose } = useDisclosure();
  const { isOpen: isInstallerOpen, onOpen: onInstallerOpen, onClose: onInstallerClose } = useDisclosure();
  const [checkedEnvKeys, setCheckedEnvKeys] = useState<ExternalKey[]>([]);

  const toggleCheck = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, key: ExternalKey) => {
    if (e.target.checked) {
      setCheckedEnvKeys((prev) => [...prev, key]);
    } else {
      setCheckedEnvKeys((prev) => prev.filter((k) => k !== key));
    }
  }, []);

  const handleFinishInstall = () => {
    setCheckedEnvKeys([]);
    onFinishInstall();
  };

  const openAgreementOrInstaller = async () => {
    const isValid = await ipc.externalClient.isSupportedPlatformValid({ ignoreManual: true });

    // do not need to install external
    if (isValid) {
      return;
    }
    let isAllAgreed = true;
    for (const key of checkedEnvKeys) {
      if (await ipc.externalClient.isAgreementNeeded(key)) {
        isAllAgreed = false;
      }
    }
    if (isAllAgreed) {
      onInstallerOpen();
      return;
    }

    onAgreementOpen();
  };

  return (
    <>
      <div>
        <InstallableExternalTable checkedEnvKeys={checkedEnvKeys} externalTools={externalTools} onToggleCheck={toggleCheck} />
        <Flex justifyContent="flex-end" mt={4}>
          <Button onClick={openAgreementOrInstaller} isDisabled={checkedEnvKeys.length === 0}>
            {`Install (${checkedEnvKeys.length})`}
          </Button>
        </Flex>
      </div>

      <ExternalToolAgreementModal
        externalKeys={checkedEnvKeys}
        isOpen={isAgreementOpen}
        onClose={onAgreementClose}
        onAccept={async () => {
          for (const key of checkedEnvKeys) {
            await ipc.externalClient.writeAgreement(key, true);
          }
          onAgreementClose();
          onInstallerOpen();
        }}
      />

      <ExternalToolInstallerModal
        externalKeyAndNames={checkedEnvKeys.map((key) => ({ key, name: externalTools.find((item) => item.key === key)?.name ?? '' }))}
        isOpen={isInstallerOpen}
        onClose={onInstallerClose}
        onFinish={handleFinishInstall}
      />
    </>
  );
};

export default DoctorExternalToolInspector;
