import fs from 'fs';
import os from 'os';

export class DirectoryRotation {
  public readonly basePath: string;

  constructor(public readonly category: string, public readonly periodMinutes: number) {
    this.basePath = `${os.tmpdir()}/dogu-${category}/`;
  }

  public getCurrentWavePath(): string {
    return `${this.basePath}${this.getCurrentWaveName()}/`;
  }

  public async removeOldWaves(): Promise<void> {
    if (fs.existsSync(this.basePath) === false) {
      return;
    }

    const dirs = await fs.promises.readdir(this.basePath);
    for (const dir of dirs) {
      if (dir === this.getCurrentWaveName()) {
        continue;
      }
      const targetPath = `${this.basePath}${dir}`;
      const stat = await fs.promises.stat(targetPath).catch(() => {
        console.warn(`Failed to stat ${targetPath}`);
        return { isDirectory: () => false };
      });
      if (stat.isDirectory() === false) {
        await fs.promises.rm(targetPath).catch(() => {
          console.warn(`Failed to remove ${targetPath}`);
        });
      } else {
        await fs.promises.rmdir(`${this.basePath}${dir}`, { recursive: true }).catch(() => {
          console.warn(`Failed to remove ${targetPath}`);
        });
      }
    }
  }

  private getCurrentWaveName(): string {
    const now = new Date();
    const wave = Math.floor(now.getTime() / 60000 / this.periodMinutes);
    return `${wave}`;
  }
}
