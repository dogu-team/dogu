import { DataNode } from 'antd/es/tree';
import styled from 'styled-components';
import { useEffect } from 'react';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import GameObjectDetail from './GameObjectDetail';
import InspectorUITree from './InspectorUITree';
import InspectorToolbar from './InspectorToolbar';
import InspectorContextMenu from './InspectorContextMenu';
import useInspector, { GAMIUM_CONTEXT_KEY } from '../../hooks/streaming/useInspector';
import NativeObjectDetail from './NativeObjectDetail';
import { GamiumNodeAttributes, InspectNode } from '../../types/inspector';

interface Props {
  inspector: ReturnType<typeof useInspector>;
}

const Inspector = ({ inspector }: Props) => {
  const { mode, peerConnection, loading } = useDeviceStreamingContext();
  const node = inspector.contextAndNodes?.find((item) => item.context === inspector.selectedContextKey)?.node;

  useEffect(() => {
    if (peerConnection?.connectionState === 'connected' && !loading) {
      inspector.connectGamium();
    }
  }, [inspector.connectGamium, peerConnection?.connectionState, loading]);

  return (
    <Box>
      <Inner h={55}>
        <InspectorToolbar
          onRefresh={inspector.updateSources}
          onReset={() => {
            inspector.clearInspectingNode();
            inspector.clearSelectedNode();
            inspector.updateSources();
            inspector.connectGamium();
          }}
        />
        <InspectorContextMenu
          contexts={inspector.contextAndNodes?.map((item) => item.context) ?? []}
          selectedContext={inspector.selectedContextKey}
          onContextChange={inspector.updateSelectedContextKey}
        />
        <Content>
          {inspector.selectedContextKey ? (
            <TreeWrapper>
              <InspectorUITree
                isInspecting={mode === 'inspect'}
                treeData={node ? [node] : ([] as DataNode[])}
                inspectingNode={inspector.inspectingNode}
                selectedNode={inspector.selectedNode}
                onClickNode={inspector.updateSelectedNode}
                onHoverNode={inspector.updateInspectingNodeByKey}
                onLeaveNode={inspector.clearInspectingNode}
              />
            </TreeWrapper>
          ) : (
            <div>Select context for inspect.</div>
          )}
        </Content>
      </Inner>
      <Inner h={45} style={{ overflow: 'auto' }}>
        {inspector.selectedContextKey === GAMIUM_CONTEXT_KEY ? (
          <GameObjectDetail node={inspector.selectedNode?.node as InspectNode<GamiumNodeAttributes> | undefined} hitPoint={undefined} />
        ) : (
          <NativeObjectDetail node={inspector.selectedNode?.node} />
        )}
      </Inner>
    </Box>
  );
};

export default Inspector;

const Box = styled.div`
  width: 100%;
  height: 100%;
`;

const Inner = styled.div<{ h: number }>`
  display: flex;
  height: ${(props) => props.h}%;
  flex-direction: column;
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
