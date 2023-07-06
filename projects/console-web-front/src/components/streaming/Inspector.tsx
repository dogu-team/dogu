import { DataNode } from 'antd/es/tree';
import styled from 'styled-components';
import { useCallback, useEffect } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import GameObjectDetail from './GameObjectDetail';
import InspectorUITree from './InspectorUITree';
import InspectorToolbar from './InspectorToolbar';
import InspectorContextMenu from './InspectorContextMenu';
import useInspector, { GAMIUM_CONTEXT_KEY } from '../../hooks/streaming/useInspector';
import NativeObjectDetail from './NativeObjectDetail';
import { GamiumNodeAttributes, InspectNode } from '../../types/inspector';
import Link from 'next/link';

interface Props {
  inspector: ReturnType<typeof useInspector>;
}

const Inspector = ({ inspector }: Props) => {
  const { mode, peerConnection, loading, updateMode } = useDeviceStreamingContext();
  const node = inspector.contextAndNodes?.find((item) => item.context === inspector.selectedContextKey)?.node;
  const isContextSelected = inspector.selectedContextKey !== undefined;

  useEffect(() => {
    if (peerConnection?.connectionState === 'connected' && !loading) {
      inspector.connectGamium();
    }
  }, [inspector.connectGamium, peerConnection?.connectionState, loading]);

  const handleClickNode = useCallback(
    (key: string) => {
      inspector.updateSelectedNode(key);
      updateMode('input');
    },
    [inspector.updateSelectedNode, updateMode],
  );

  return (
    <Box>
      <InspectorContextMenu
        contexts={inspector.contextAndNodes?.map((item) => item.context) ?? []}
        selectedContext={inspector.selectedContextKey}
        onContextChange={inspector.updateSelectedContextKey}
      />

      <FlexInner>
        {!isContextSelected && (
          <EmptyContextBox>
            <div>
              <InfoCircleOutlined style={{ fontSize: '3rem' }} />
            </div>
            <p style={{ marginTop: '1rem', fontSize: '1rem' }}>
              Select context first for inspecting.
              <br />
              <br />
              <Link href="https://docs.dogutech.io/device-farm/device/streaming-and-remote-control/ui-inspector" target="_blank">
                Click here
              </Link>{' '}
              for more information.
            </p>
          </EmptyContextBox>
        )}
        <Inner h={55}>
          <InspectorToolbar
            onRefresh={inspector.updateSources}
            onReset={() => {
              inspector.clearInspectingNode();
              inspector.clearSelectedNode();
              inspector.updateSources();
              inspector.connectGamium();
              inspector.updateSelectedContextKey(undefined);
            }}
            selectDisabled={!isContextSelected}
          />
          <Content>
            <TreeWrapper>
              <InspectorUITree
                isInspecting={mode === 'inspect'}
                treeData={node ? [node] : ([] as DataNode[])}
                inspectingNode={inspector.inspectingNode}
                selectedNode={inspector.selectedNode}
                onClickNode={handleClickNode}
                onHoverNode={inspector.updateInspectingNodeByKey}
                onLeaveNode={inspector.clearInspectingNode}
              />
            </TreeWrapper>
          </Content>
        </Inner>
        <Inner h={45} style={{ overflow: 'auto' }}>
          {inspector.selectedContextKey === GAMIUM_CONTEXT_KEY ? (
            <GameObjectDetail node={inspector.selectedNode?.node as InspectNode<GamiumNodeAttributes> | undefined} hitPoint={inspector.hitPoint} />
          ) : (
            <NativeObjectDetail node={inspector.selectedNode?.node} />
          )}
        </Inner>
      </FlexInner>
    </Box>
  );
};

export default Inspector;

const Box = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const FlexInner = styled.div`
  position: relative;
  height: 100%;
  flex: 1;
`;

const EmptyContextBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  margin-top: 3rem;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  z-index: 10;
`;

const Inner = styled.div<{ h: number }>`
  display: flex;
  height: ${(props) => props.h}%;
  flex-direction: column;
  border-top: 1px solid ${(props) => props.theme.main.colors.gray6};
`;

const Content = styled.div`
  position: relative;
  flex: 1;
  overflow: auto;
`;

const TreeWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;
