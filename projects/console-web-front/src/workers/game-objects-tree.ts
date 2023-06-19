import { DataNode } from 'antd/es/tree';
import { ObjectHierarchyNode, ObjectsHierarchy } from 'gamium/common';

const convertRoot = (root: ObjectsHierarchy[]) => {
  const converted = root.map((item) => ({ key: `${item.name}`, title: `${item.name}`, children: item.children }));
  return converted;
};

const convertNode = (node: ObjectHierarchyNode[]) => {
  const d: DataNode[] = node.map((item) => ({
    key: `${item.path}`,
    title: item.name,
    children: convertNode(item.children),
  }));

  return d;
};

self.onmessage = (e) => {
  const data: ObjectsHierarchy[] = e.data;
  const convertedRoot = convertRoot(data);
  const dn: DataNode[] = convertedRoot.map((item) => ({ ...item, children: convertNode(item.children) }));

  self.postMessage(dn);
};

export {};
