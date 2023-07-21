import { Tabs, TabsProps } from 'antd';
import CodeWithCopyButton from '../common/CodeWithCopyButton';

interface Props {
  shell: {
    windowsCmd?: string[];
    windowsPs?: string[];
    linuxAndMac?: string[];
  };
}

const labelText: { [key in keyof Props['shell']]: string } = {
  windowsCmd: 'Windows Command Prompt',
  windowsPs: 'Windows PowerShell',
  linuxAndMac: 'Linux and macOS',
};

const language: { [key in keyof Props['shell']]: string } = {
  windowsCmd: 'batch',
  windowsPs: 'powershell',
  linuxAndMac: 'bash',
};

const PlatformSpecifiedShell = ({ shell }: Props) => {
  const items: TabsProps['items'] = Object.keys(shell).map((key) => ({
    key,
    label: labelText[key as keyof Props['shell']],
    children: shell[key as keyof Props['shell']]?.map((cmd) => <CodeWithCopyButton key={cmd} code={cmd} language={language[key as keyof Props['shell']] ?? 'bash'} />),
  }));

  return <Tabs items={items} />;
};

export default PlatformSpecifiedShell;
