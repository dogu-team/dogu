import { Circus } from '@jest/types';

export type JestDescribeNode = Pick<Circus.DescribeBlock, 'name' | 'type' | 'parent' | 'hooks' | 'children'>;
export type JestTestNode = Pick<Circus.TestEntry, 'name' | 'type' | 'parent'>;
export type JestHookNode = Pick<Circus.Hook, 'type' | 'parent'>;
export type JestUniqueNode = JestDescribeNode | JestTestNode;
export type JestNode = JestUniqueNode | JestHookNode;

export const JestRootNodeName = 'ROOT_DESCRIBE_BLOCK';
