import PlatformSpecifiedShell from './PlatformSpecifiedShell';

const PythonVirtualEnvShell = () => {
  return (
    <PlatformSpecifiedShell
      shell={{
        windowsCmd: ['python3 -m venv .venv', '.venv\\Scripts\\activate.bat'],
        windowsPs: ['python3 -m venv .venv', '.venv\\Scripts\\Activate.ps1'],
        linuxAndMac: ['python3 -m venv .venv', 'source .venv/bin/activate'],
      }}
    />
  );
};

export default PythonVirtualEnvShell;
