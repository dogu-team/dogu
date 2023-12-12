import { DataNode } from 'antd/es/tree';
import { ObjectHierarchyNode, ObjectsHierarchy } from 'gamium/common';

const convertRoot = (root: ObjectsHierarchy[]) => {
  const converted: { key: string; title: string; children: ObjectHierarchyNode[] }[] = root
    .map((item) => ({ key: `${item.name}`, title: `${item.name}`, children: item.children }))
    .filter((item) => !!item.key);
  return converted;
};

const convertNode = (node: ObjectHierarchyNode[], parentPath: string) => {
  const siblingMap = new Map<string, number>();
  const dn: DataNode[] = node.map((item) => {
    if (siblingMap.has(item.name)) {
      siblingMap.set(item.name, siblingMap.get(item.name)! + 1);
    } else {
      siblingMap.set(item.name, 1);
    }

    return {
      key: `${parentPath}/${item.name}[${siblingMap.get(item.name)}]`,
      title: item.name,
      children: convertNode(item.children, `${parentPath}/${item.name}[${siblingMap.get(item.name)}]`),
    };
  });

  return dn;
};

self.onmessage = (e) => {
  const data: ObjectsHierarchy[] = e.data;
  const convertedRoot = convertRoot(data);
  const dn: DataNode[] = convertedRoot.map((item, i) => ({
    ...item,
    children: convertNode(item.children, ''),
  }));

  self.postMessage(dn);
};
