import { Dropdown, Empty, MenuProps, message, Tree } from 'antd';
import { DataNode } from 'antd/es/tree';
import useTranslation from 'next-translate/useTranslation';
import { Key, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Trans from 'next-translate/Trans';
import Link from 'next/link';

import { flexRowCenteredStyle } from '../../styles/box';
import { ResizedObjectInfo } from '../../types/streaming';
import { InspectNode } from '../../workers/native-ui-tree';
import { InspectNodeWithPosition } from '../../hooks/streaming/useInspector';

interface Props {
  isInspecting: boolean;
  treeData: DataNode[];
  inspectingNode: InspectNodeWithPosition | undefined;
  selectedNode: InspectNodeWithPosition | undefined;
  onClickNode: (key: string) => Promise<void> | void;
  onHoverNode: (key: string) => Promise<void> | void;
  onLeaveNode: () => void;
}

const InspectorUITree = ({ isInspecting, treeData, inspectingNode, selectedNode, onClickNode, onHoverNode, onLeaveNode }: Props) => {
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [autoExpandedParents, setAutoExpandedParents] = useState(true);
  const [clickedItem, setClickedItem] = useState<{ key: string; name: string }>();
  const [treeWidth, setTreeWidth] = useState<number>();
  const ref = useRef<HTMLDivElement>(null);
  const treeRef = useRef<any>(null);
  const { t } = useTranslation();

  const handleExpand = (keys: Key[]) => {
    setExpandedKeys(keys);
    setAutoExpandedParents(false);
    setTimeout(() => {
      const elems = document.getElementsByClassName('ant-tree-list-holder-inner');
      if (elems.length > 0) {
        setTreeWidth(elems[0].clientWidth);
      }
    }, 50);
  };

  useEffect(() => {
    if (selectedNode) {
      setAutoExpandedParents(true);
      setTimeout(() => {
        treeRef.current?.scrollTo({ key: selectedNode.node.key, offset: 10 });
      }, 100);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (isInspecting && inspectingNode) {
      setAutoExpandedParents(true);
      setTimeout(() => {
        treeRef.current?.scrollTo({ key: inspectingNode.node.key, offset: 10 });
      }, 100);
    }
  }, [inspectingNode, isInspecting]);

  const menu: MenuProps['items'] = [
    {
      key: 'copy-id',
      label: <StyledMenuItem>Copy path</StyledMenuItem>,
      onClick: async () => {
        if (clickedItem) {
          try {
            await navigator.clipboard.writeText(clickedItem.key);
            message.success(t('common:copyClipboard'));
            setClickedItem(undefined);
          } catch (e) {
            message.error(t('common:copyClipboardFailed'));
          }
        }
      },
      style: { padding: '0' },
    },
    {
      key: 'copy-name',
      label: <StyledMenuItem>Copy name</StyledMenuItem>,
      onClick: async () => {
        if (clickedItem) {
          try {
            await navigator.clipboard.writeText(clickedItem.name);
            message.success('Copied to clipboard');
            setClickedItem(undefined);
          } catch (e) {}
        }
      },
      style: { padding: '0' },
    },
  ];

  // const retrieveGameObject = async (id: string) => {
  //   await getObjectDetailById(id);
  // };

  return (
    <Box>
      <TreeWrapper ref={ref}>
        {treeData?.length === 0 ? (
          <EmptyBox>
            <Empty
              description={
                <Trans
                  i18nKey="device-streaming:inspectorEmptyTreeText"
                  components={{ br: <br />, link: <Link href="https://docs.dogutech.io/host-and-device/device/streaming-and-remote-control/game-ui-inspector" target="_blank" /> }}
                />
              }
            />
          </EmptyBox>
        ) : (
          <StyledTree
            ref={treeRef}
            treeData={treeData}
            height={ref.current?.offsetHeight}
            expandedKeys={[...expandedKeys, selectedNode?.node.key].filter((k) => !!k) as string[]}
            autoExpandParent={autoExpandedParents}
            onExpand={handleExpand}
            defaultExpandAll
            w={treeWidth}
            titleRender={(node) => {
              if ('key' in node) {
                if (selectedNode?.node.key === node.key) {
                  return (
                    <Dropdown
                      trigger={['contextMenu']}
                      onOpenChange={(open) => {
                        if (open) {
                          setClickedItem({ key: `${node.key}`, name: `${node.title}` });
                        } else {
                          setClickedItem(undefined);
                        }
                      }}
                      menu={{ items: menu }}
                    >
                      <div
                        onClick={() => {
                          if (node.key !== selectedNode?.node.key) {
                            onClickNode(`${node.key}`);
                          }
                        }}
                        onMouseEnter={() => onHoverNode(`${node.key}`)}
                        onMouseLeave={onLeaveNode}
                        style={{ color: 'red', backgroundColor: 'skyblue', height: '100%', whiteSpace: 'nowrap' }}
                      >
                        {node.title as React.ReactNode}
                      </div>
                    </Dropdown>
                  );
                }

                return (
                  <Dropdown
                    trigger={['contextMenu']}
                    menu={{ items: menu }}
                    onOpenChange={(open) => {
                      if (open) {
                        setClickedItem({ key: `${node.key}`, name: `${node.title}` });
                      } else {
                        setClickedItem(undefined);
                      }
                    }}
                  >
                    <div
                      onClick={() => {
                        if (node.key !== selectedNode?.node.key) {
                          onClickNode(`${node.key}`);
                        }
                      }}
                      onMouseEnter={() => onHoverNode(`${node.key}`)}
                      onMouseLeave={onLeaveNode}
                      style={{ height: '100%', whiteSpace: 'nowrap' }}
                    >
                      {node.title as React.ReactNode}
                    </div>
                  </Dropdown>
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

export default InspectorUITree;

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

const StyledMenuItem = styled.div`
  padding: 4px 6px;
  border-radius: 4px;

  &:hover {
    background-color: ${(props) => props.theme.colorPrimary}22;
  }
`;

const EmptyBox = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
  height: 100%;
`;
