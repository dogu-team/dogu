import { Printable } from '@dogu-tech/common';
import { ChildProcess, exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { pathMap } from './path-map';
import { Timer } from './timer';

const ext = process.platform === 'win32' ? '.exe' : '';
const gdcPath = path.resolve(pathMap.root, 'third-party', process.platform, process.arch, `go-device-controller${ext}`);
const recordPath = path.resolve(pathMap.root, `e2e/generated/record/screen-${process.env.RUNNER_OS ?? 'unknown'}-${process.env.GITHUB_WORKFLOW_SHA ?? 'unknown'}.webm`);
const ffmpegPath = path.resolve(pathMap.root, 'third-party', process.platform, 'common', `ffmpeg${ext}`);

export class GdcScreenRecorder {
  constructor(private readonly printable: Printable, private child: ChildProcess | undefined = undefined) {}

  start(): void {
    console.log(gdcPath);
    console.log(recordPath);

    const command = `${gdcPath} --utilMode=true --utilType=record --filePath=${recordPath} --fps=5 --resolution=1080`;

    this.child = exec(command, { cwd: path.dirname(gdcPath) });
    this.child.stdout?.pipe(process.stdout);
    this.child.stderr?.pipe(process.stderr);
    this.child.on('exit', (code) => {
      console.log(`GDC screen recorder exited with code ${code ?? 'null'}`);
      // gdc screen recorder is signaled to stop
    });
  }

  async stop(): Promise<void> {
    if (!this.child) {
      return;
    }
    try {
      this.child.kill('SIGINT');
      if (process.platform === 'win32') {
        if (this.child?.pid) {
          execSync(`taskkill /PID ${this.child.pid} /F /T`);
        } else {
          execSync(`taskkill /IM go-device-controller.exe /F /T`);
        }
      }
    } catch (e) {
      console.log(`GDC screen recorder kill failed: ${e}`);
    }
    await Timer.wait(300, 'gdc recorder wait to be kiiled');
    if (!fs.existsSync(recordPath)) {
      console.warn('record file not found');
      return;
    }
    try {
      const convPath = `${recordPath}.conv.webm`;
      const tmpRecordPath = `${recordPath}.tmp`;
      execSync(`${ffmpegPath} -i ${recordPath} -c copy -fflags +genpts ${convPath}`, {});
      await fs.promises.rename(recordPath, tmpRecordPath);
      await fs.promises.rename(convPath, recordPath);
      await fs.promises.rm(tmpRecordPath, { force: true });
    } catch (e) {
      console.log(`GDC screen recorder convert failed: ${e}`);
    }
  }
}
