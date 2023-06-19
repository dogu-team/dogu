import { QuestionIcon } from '@chakra-ui/icons';
import { Box, VStack, Text, HStack, Input, Tooltip, Icon, Button, Textarea, Progress } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ExternalKey } from '../shares/external';
import { ipc } from '../utils/window';

interface ExternalInfo {
  key: ExternalKey;
  name: string;
  progress: number;
  status: string;
}

interface InstallerProps {
  onClose: () => void;
}

export default function Installer(props: InstallerProps) {
  const [dotEnvConfigPath, setDotEnvConfigPath] = useState<string>('');
  const [isAllInstallCompleted, setIsAllInstallCompleted] = useState<boolean>(false);
  const [log, setLog] = useState<string>('');
  const [externalInfos, setExternalInfos] = useState<ExternalInfo[]>([]);
  const [externalInfoElements, setExternalInfoElements] = useState<JSX.Element[]>([]);
  const [isCancel, setIsCancel] = useState<boolean>(false);
  const [currentInstallExternalKey, setCurrentInstallExternalKey] = useState<ExternalKey | null>(null);

  useEffect(() => {
    (async () => {
      ipc.stdLogCallback.onStdout((_, message) => {
        setLog((prev) => `${prev}\n${message}`);
      });
      ipc.stdLogCallback.onStderr((_, message) => {
        setLog((prev) => `${prev}\n${message}`);
      });
      ipc.externalCallback.onDownloadStarted((_, externalKey) => {
        setExternalInfos((prev) => {
          const newInfos = [...prev];
          for (const info of newInfos) {
            if (info.key === externalKey) {
              info.status = 'Downloading';
              break;
            }
          }
          return newInfos;
        });
      });
      ipc.externalCallback.onDownloadInProgress((_, externalKey, progress) => {
        setExternalInfos((prev) => {
          const newInfos = [...prev];
          for (const info of newInfos) {
            if (info.key === externalKey) {
              info.progress = Math.floor(progress.percent * 100);
              break;
            }
          }
          return newInfos;
        });
      });
      ipc.externalCallback.onDownloadCompleted((_, externalKey) => {
        setExternalInfos((prev) => {
          const newInfos = [...prev];
          for (const info of newInfos) {
            if (info.key === externalKey) {
              info.status = 'Downloaded';
              break;
            }
          }
          return newInfos;
        });
      });
      ipc.externalCallback.onInstallStarted((_, externalKey) => {
        setExternalInfos((prev) => {
          const newInfos = [...prev];
          for (const info of newInfos) {
            if (info.key === externalKey) {
              info.status = 'Installing';
              break;
            }
          }
          return newInfos;
        });
      });
      ipc.externalCallback.onInstallCompleted((_, externalKey) => {
        setExternalInfos((prev) => {
          const newInfos = [...prev];
          for (const info of newInfos) {
            if (info.key === externalKey) {
              info.status = 'Installed';
              break;
            }
          }
          return newInfos;
        });
      });
      setDotEnvConfigPath(await ipc.dotEnvConfigClient.getDotEnvConfigPath());
      const isSupportedPlatformValid = await ipc.externalClient.isSupportedPlatformValid();
      if (isSupportedPlatformValid) {
        setIsAllInstallCompleted(true);
        return;
      }
      const externalKeys = await ipc.externalClient.getKeys();
      const externalInfos: ExternalInfo[] = [];
      for (const externalKey of externalKeys) {
        const isPlatformSupported = await ipc.externalClient.isPlatformSupported(externalKey);
        if (!isPlatformSupported) {
          continue;
        }
        const isInstallNeeded = await ipc.externalClient.isInstallNeeded(externalKey);
        if (!isInstallNeeded) {
          continue;
        }
        const name = await ipc.externalClient.getName(externalKey);
        externalInfos.push({
          key: externalKey,
          name,
          progress: 0,
          status: 'Not Installed',
        });
      }
      if (externalInfos.length === 0) {
        setIsAllInstallCompleted(true);
        return;
      }
      setExternalInfos(externalInfos);
      setExternalInfoElements(
        externalInfos.map((externalInfo) => (
          <HStack key={externalInfo.key}>
            <Text>{externalInfo.name}</Text>
            <Progress value={externalInfo.progress} />
            <Text>{externalInfo.status}</Text>
          </HStack>
        )),
      );
      for (const externalInfo of externalInfos) {
        if (isCancel) {
          break;
        }
        setCurrentInstallExternalKey(externalInfo.key);
        await ipc.externalClient.install(externalInfo.key);
      }
      setCurrentInstallExternalKey(null);
      setIsAllInstallCompleted(true);
    })();
  }, []);

  return (
    <Box>
      <VStack>
        <Text fontSize="xl">Installer</Text>
        <HStack>
          <Text fontSize="lg">DotEnv Config Path</Text>
          <Input readOnly value={dotEnvConfigPath} color="gray.500" />
          <Tooltip hasArrow label="The path to the setup file cannot be changed by convention" bg="white">
            <Icon as={QuestionIcon} color="gray.500" />
          </Tooltip>
        </HStack>
        <Box>
          <HStack>
            <Text fontSize="lg">Name</Text>
            <Text fontSize="lg">Progress</Text>
            <Text fontSize="lg">Status</Text>
          </HStack>
        </Box>
        <Box>
          <VStack>{externalInfoElements}</VStack>
        </Box>
        <Box>
          <Textarea readOnly color="gray.500" value={log} />
        </Box>
        <Box>
          <HStack>
            {!isAllInstallCompleted && (
              <Button
                display="block"
                onClick={() => {
                  setIsCancel(true);
                  if (currentInstallExternalKey) {
                    ipc.externalClient.cancelInstall(currentInstallExternalKey);
                  }
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              disabled={!isAllInstallCompleted}
              color={isAllInstallCompleted ? 'white' : 'gray.500'}
              onClick={() => {
                props.onClose();
              }}
            >
              Close
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
