import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const SystemProfiler = 'system_profiler';
const SystemProfilerTimeout = 10 * 1000;

export async function usbDataTypeToSerials(): Promise<string[]> {
  const { stdout } = await execAsync(`${SystemProfiler} SPUSBDataType`, { timeout: SystemProfilerTimeout });
  const serials: string[] = [];
  for (const line of stdout.split('\n')) {
    const matches = line.match(/Serial Number: (.+)/);
    if (matches) {
      serials.push(matches[1]);
    }
  }
  const modifiedSerials = serials.map((serial) => {
    // 00008110000559600E8A801E to 00008110-000559600E8A801E
    if (serial.length === 24) {
      return `${serial.slice(0, 8)}-${serial.slice(8)}`;
    } else {
      return serial;
    }
  });
  return modifiedSerials;
}
