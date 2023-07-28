import { createLogger } from '../common-utils.js';
import { JestDescribeNode, JestHookNode, JestNode, JestRootNodeName, JestUniqueNode } from '../jest-utils.js';

export enum DestType {
  JOB = 0,
  UNIT = 1,
}

export enum DestState {
  UNSPECIFIED = 0,
  PENDING = 1,
  RUNNING = 2,
  FAILED = 3,
  PASSED = 4,
  SKIPPED = 5,
}

export class DestStateUtil {
  static isCompleted(state: DestState): boolean {
    return [DestState.FAILED, DestState.PASSED, DestState.SKIPPED].includes(state);
  }
}

export interface DestInfo {
  name: string;
  type: DestType;
  children: DestInfo[];
}

export interface JestInfo extends Omit<DestInfo, 'children'> {
  reference: JestNode;
  children: JestInfo[];
}

export function createJestInfoRecursive(jestNode: JestNode): JestInfo[] {
  if (jestNode.type === 'describeBlock') {
    const { name, children, hooks } = jestNode;
    const beforeAlls = hooks.filter((hook) => hook.type === 'beforeAll');
    const beforeAllJestInfos = beforeAlls.map((beforeAll) => {
      return {
        name: beforeAll.type,
        type: DestType.UNIT,
        children: [],
        reference: beforeAll,
      };
    });
    const afterAlls = hooks.filter((hook) => hook.type === 'afterAll');
    const afterAllJestInfos = afterAlls.map((afterAll) => {
      return {
        name: afterAll.type,
        type: DestType.UNIT,
        children: [],
        reference: afterAll,
      };
    });
    const childrenJestInfos = children.flatMap((child) => createJestInfoRecursive(child));
    return [
      {
        name,
        type: DestType.JOB,
        children: [...beforeAllJestInfos, ...childrenJestInfos, ...afterAllJestInfos],
        reference: jestNode,
      },
    ];
  } else if (jestNode.type === 'test') {
    let beforeEachs: JestHookNode[] = [];
    let afterEachs: JestHookNode[] = [];
    let parent: JestDescribeNode | undefined = jestNode.parent;
    while (parent) {
      const { hooks } = parent;
      if (parent.name === JestRootNodeName) {
        /**
         * @note The first beforeEach of ROOT_DESCRIBE_BLOCK is jest internal hook. exclude it.
         */
        beforeEachs = [...hooks.filter((hook) => hook.type === 'beforeEach').slice(1), ...beforeEachs];
      } else {
        beforeEachs = [...hooks.filter((hook) => hook.type === 'beforeEach'), ...beforeEachs];
      }
      afterEachs = [...afterEachs, ...hooks.filter((hook) => hook.type === 'afterEach')];
      parent = parent.parent;
    }

    const { name } = jestNode;
    const beforeEachJestInfos = beforeEachs.map((beforeEach) => {
      return {
        name: beforeEach.type,
        type: DestType.UNIT,
        children: [],
        reference: beforeEach,
      };
    });
    const afterEachJestInfos = afterEachs.map((afterEach) => {
      return {
        name: afterEach.type,
        type: DestType.UNIT,
        children: [],
        reference: afterEach,
      };
    });
    return [
      ...beforeEachJestInfos,
      {
        name,
        type: DestType.UNIT,
        children: [],
        reference: jestNode,
      },
      ...afterEachJestInfos,
    ];
  } else if (jestNode.type === 'beforeAll' || jestNode.type === 'afterAll' || jestNode.type === 'beforeEach' || jestNode.type === 'afterEach') {
    return [
      {
        name: jestNode.type,
        type: DestType.UNIT,
        children: [],
        reference: jestNode,
      },
    ];
  } else {
    throw new Error(`Internal error. Unknown node type: ${jestNode.type}`);
  }
}

export interface DestData {
  id: string;
  ownerId: string;
  name: string;
  type: DestType;
  index: number;
  state: DestState;
  children: DestData[];
}

export interface JestData extends Omit<DestData, 'children'> {
  reference: JestNode;
  children: JestData[];
}

export abstract class DestHandler<DestInfoLike = any, DestDataLike = any> {
  private readonly _logger = createLogger('DestHandler');
  protected rootJestData: JestData | null = null;

  async onCreate(rootJestInfo: JestInfo): Promise<void> {
    const jestInfos = rootJestInfo.children;
    const destInfos = jestInfos.map((jestInfo) => this.onTransformJestInfoToDestInfo(jestInfo));
    const destInfoLikes = destInfos.map((destInfo) => this.onTransformDestInfoToDestInfoLike(destInfo));
    const destDataLikes = await this.onCreateDestInfoLikes(destInfoLikes);
    const destDatas = destDataLikes.map((destDataLike) => this.onTransformDestDataLikeToDestData(destDataLike));
    const jestDatas = destDatas.map((destData, index) => this.onTransformDestDataToJestData(destData, jestInfos[index]));
    this.rootJestData = {
      name: rootJestInfo.name,
      children: jestDatas,
      reference: rootJestInfo.reference,
      id: '',
      ownerId: '',
      type: DestType.JOB,
      index: 0,
      state: DestState.UNSPECIFIED,
    };
  }

  async onUpdate(scopeNode: JestUniqueNode, currentNode: JestNode, destState?: DestState): Promise<void> {
    if (!this.rootJestData) {
      throw new Error('Internal error. rootJestData is null');
    }

    if (currentNode.type === 'describeBlock') {
      const paths = this.createPaths(currentNode);
      const jestData = this.findByPaths(paths, this.rootJestData);
      if (!jestData) {
        throw new Error('Internal error. jestData is null');
      }
    } else if (currentNode.type === 'test') {
      const paths = this.createPaths(currentNode);
      const jestData = this.findByPaths(paths, this.rootJestData);
      if (!jestData) {
        throw new Error('Internal error. jestData is null');
      }
    } else if (currentNode.type === 'beforeAll' || currentNode.type === 'afterAll' || currentNode.type === 'beforeEach' || currentNode.type === 'afterEach') {
    } else {
      throw new Error(`Internal error. Unknown node type: ${currentNode.type}`);
    }

    let destStateTemp = destState;
    if (destStateTemp === undefined) {
      function resolveStateRecursive(destData: JestData): DestState {
        const { children } = destData;
        if (children.length === 0) {
          return destData.state;
        }
        const childStates = children.map((child) => resolveStateRecursive(child));
        if (childStates.some((childState) => childState === DestState.FAILED)) {
          return DestState.FAILED;
        } else if (childStates.some((childState) => childState === DestState.SKIPPED)) {
          return DestState.SKIPPED;
        }
        return DestState.PASSED;
      }

      destStateTemp = resolveStateRecursive(destData);
    }

    destData.state = destStateTemp;

    const { reference, children, ...rest } = destData;
    this._logger.info(`update dest`, {
      ...rest,
    });

    const destDataLike = this.onTransformDestDataToDestDataLike(destData);
    return this.onUpdateDestDataLike(destDataLike, destStateTemp);
  }

  private createPaths(jestUniqueNode: JestUniqueNode): string[] {
    let current: JestUniqueNode | undefined = jestUniqueNode;
    const paths: string[] = [];
    while (current) {
      paths.unshift(current.name);
      current = current.parent;
    }
    return paths;
  }

  private findByPaths(paths: string[], jestData: JestData): JestData | undefined {
    if (paths.length === 0) {
      return jestData;
    }

    const [path, ...restPaths] = paths;
    const childJestData = jestData.children.find((child) => child.name === path);
    if (!childJestData) {
      return undefined;
    }
    return this.findByPaths(restPaths, childJestData);
  }

  private onTransformJestInfoToDestInfo(jestInfo: JestInfo): DestInfo {
    const { children, reference, ...rest } = jestInfo;
    return {
      ...rest,
      children: children.map((child) => this.onTransformJestInfoToDestInfo(child)),
    };
  }

  private onTransformDestDataToJestData(destData: DestData, jestInfo: JestInfo): JestData {
    return {
      ...destData,
      reference: jestInfo.reference,
      children: destData.children.map((childDestData, index) => {
        const childJestInfo: JestInfo | undefined = jestInfo.children[index];
        if (!childJestInfo) {
          throw new Error('Internal error. childJestInfo is null');
        }
        return this.onTransformDestDataToJestData(childDestData, childJestInfo);
      }),
    };
  }

  abstract onTransformDestInfoToDestInfoLike(destInfo: DestInfo): DestInfoLike;
  abstract onTransformDestDataLikeToDestData(destDataLike: DestDataLike): DestData;
  abstract onTransformDestDataToDestDataLike(destData: DestData): DestDataLike;
  abstract onCreateDestInfoLikes(destInfoLikes: DestInfoLike[]): Promise<DestDataLike[]>;
  abstract onUpdateDestDataLike(destDataLike: DestDataLike, destState: DestState): Promise<void>;
}

export class NullDestHandler extends DestHandler<DestInfo, DestData> {
  onTransformDestInfoToDestInfoLike(destInfo: DestInfo): DestInfo {
    const { children, ...rest } = destInfo;
    return {
      ...rest,
      children: children.map((child) => this.onTransformDestInfoToDestInfoLike(child)),
    };
  }

  onTransformDestDataLikeToDestData(destDataLike: DestData): DestData {
    return destDataLike;
  }

  onTransformDestDataToDestDataLike(destData: JestData): DestData {
    return destData;
  }

  async onCreateDestInfoLikes(destInfoLikes: DestInfo[]): Promise<DestData[]> {
    return [];
  }

  async onUpdateDestDataLike(destDataLike: DestData, destState: DestState): Promise<void> {
    return;
  }
}
