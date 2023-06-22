import { Button, Flex, useDisclosure } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { ExternalToolInfo } from '../../hooks/platform-supported-external-info';

import { ExternalKey } from '../../shares/external';
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

    // open installer if checkedEnvKeys has only 'appium', 'appium-ios' elements
    if (checkedEnvKeys.length === 2 && checkedEnvKeys.includes('appium-xcuitest-driver') && checkedEnvKeys.includes('appium-uiautomator2-driver')) {
      onInstallerOpen();
      return;
    }

    onAgreementOpen();
  };

  return (
    <>
      <div>
        <InstallableExternalTable externalTools={externalTools} onToggleCheck={toggleCheck} />
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
        onAccept={() => {
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
