export type ExplorerNode = {
  type: 'file' | 'dir';
  name: string;
  path: string;
};

export type ExplorerTree = {
  [dir: string]: { depth: number; children: ExplorerNode[] };
};
