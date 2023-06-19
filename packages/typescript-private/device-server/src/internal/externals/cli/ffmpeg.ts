import { Printable } from '@dogu-tech/common';
import { ChildProcess } from '@dogu-tech/node';
import { pathMap } from '../../../path-map';

export async function makeWebmSeekable(inputPath: string, outputPath: string, printable: Printable): Promise<void> {
  await ChildProcess.exec(`${pathMap().common.ffmpeg} -i ${inputPath} -c copy -fflags +genpts ${outputPath}`, {}, printable);
}
