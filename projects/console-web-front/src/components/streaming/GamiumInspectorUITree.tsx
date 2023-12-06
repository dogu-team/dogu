import { Empty, Tree } from 'antd';
import { DataNode } from 'antd/es/tree';
import { Key, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Trans from 'next-translate/Trans';
import Link from 'next/link';
import { NodeAttributes, NodeWithPosition } from '@dogu-private/console';

import { flexRowCenteredStyle } from '../../styles/box';
import InspectorTreeTitle from './InspectorTreeTitle';
import { ResizedObjectInfo } from '../../types/streaming';

interface Props {
  isInspecting: boolean;
  treeData: DataNode[];
  inspectingNode: ResizedObjectInfo | undefined;
  selectedNode: ResizedObjectInfo | undefined;
  onClickNode: (key: string) => Promise<void> | void;
  onHoverNode: (key: string) => Promise<void> | void;
  onLeaveNode: () => void;
}

const GamiumInspectorUITree = ({
  isInspecting,
  treeData,
  inspectingNode,
  selectedNode,
  onClickNode,
  onHoverNode,
  onLeaveNode,
}: Props) => {
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [autoExpandedParents, setAutoExpandedParents] = useState(true);
  const [treeWidth, setTreeWidth] = useState<number>();
  const ref = useRef<HTMLDivElement>(null);
  const treeRef = useRef<any>(null);

  const updateTreeWidth = () => {
    const elems = document.getElementsByClassName('ant-tree-list-holder-inner');
    if (elems.length > 0) {
      setTreeWidth(elems[0].clientWidth);
    }
  };

  const handleExpand = (keys: Key[]) => {
    setExpandedKeys(keys);
    setAutoExpandedParents(false);
    setTimeout(() => {
      updateTreeWidth();
    }, 50);
  };

  useEffect(() => {
    if (selectedNode) {
      setAutoExpandedParents(true);
      setTimeout(() => {
        updateTreeWidth();
        treeRef.current?.scrollTo({ key: selectedNode.origin.path, offset: 10 });
      }, 100);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (isInspecting && inspectingNode) {
      setAutoExpandedParents(true);
      setExpandedKeys((prev) => [...prev, inspectingNode.origin.path]);
      setTimeout(() => {
        updateTreeWidth();
        treeRef.current?.scrollTo({ key: inspectingNode.origin.path, offset: 10 });
      }, 100);
    }
  }, [inspectingNode, isInspecting]);

  return (
    <Box>
      <TreeWrapper ref={ref}>
        {treeData?.length === 0 ? (
          <EmptyBox>
            <Empty
              description={
                <Trans
                  i18nKey="device-streaming:gamiumInspectorEmptyTreeText"
                  components={{
                    br: <br />,
                    link: (
                      <Link
                        href="https://docs.dogutech.io/device-farm/device/streaming-and-remote-control/ui-inspector"
                        target="_blank"
                      />
                    ),
                  }}
                />
              }
            />
          </EmptyBox>
        ) : (
          <StyledTree
            ref={treeRef}
            treeData={treeData}
            height={ref.current?.offsetHeight}
            expandedKeys={[...expandedKeys, selectedNode?.origin.path].filter((k) => !!k) as string[]}
            autoExpandParent={autoExpandedParents}
            onExpand={handleExpand}
            defaultExpandAll
            w={treeWidth}
            titleRender={(node) => {
              if ('key' in node) {
                return (
                  <InspectorTreeTitle
                    node={node}
                    selected={selectedNode?.origin.path === node.key}
                    hovered={inspectingNode?.origin.path === node.key}
                    onClickNode={onClickNode}
                    onHoverNode={onHoverNode}
                    onLeaveNode={onLeaveNode}
                  />
                );
              }

              return null;
            }}
          />
        )}
      </TreeWrapper>
    </Box>
  );
};

export default GamiumInspectorUITree;

const Box = styled.div`
  width: 100%;
  height: 100%;
`;

const TreeWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    background-color: transparent;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
  }

  @media screen and (max-width: 767px) {
    display: none;
  }
`;

const StyledTree = styled(Tree)<{ w?: number }>`
  width: ${(props) => (props.w ? `max(100%, ${props.w}px)` : '100%')};

  .ant-tree-list-holder-inner {
    width: max-content;
  }
`;

const EmptyBox = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
  height: 100%;
`;
