import { DataNode } from 'antd/es/tree';
import styled from 'styled-components';
import { useCallback, useEffect } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { Radio } from 'antd';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import GameObjectDetail from './GameObjectDetail';
import InspectorUITree from './InspectorUITree';
import InspectorToolbar from './InspectorToolbar';
import InspectorContextMenu from './InspectorContextMenu';
import useInspector from '../../hooks/streaming/useInspector';
import NativeObjectDetail from './NativeObjectDetail';
import useGamiumInspector from '../../hooks/streaming/useGamiumInspector';
import { InspectorType } from '../../types/streaming';
import GamiumInspectorUITree from './GamiumInspectorUITree';

interface Props {
  inspector: ReturnType<typeof useInspector>;
  gamiumInspector: ReturnType<typeof useGamiumInspector>;
}

const Inspector = ({ inspector, gamiumInspector }: Props) => {
  const { mode, inspectorType, updateInspectorType, peerConnection, loading, updateMode, gamiumService } =
    useDeviceStreamingContext();
  const node = inspector.contextAndNodes?.find((item) => item.context === inspector.selectedContextKey)?.node;
  const isContextSelected = inspector.selectedContextKey !== undefined;

  useEffect(() => {
    if (peerConnection?.connectionState === 'connected' && !loading) {
      inspector.connectGamium();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspector.connectGamium, peerConnection?.connectionState, loading]);

  const handleClickAppNode = useCallback(
    (key: string) => {
      inspector.updateSelectedNode(key);
      updateMode('input');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inspector.updateSelectedNode, updateMode],
  );

  const handleClickGameNode = useCallback(
    (key: string) => {
      gamiumInspector.updateSelectedNodeByXPath(key);
      updateMode('input');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gamiumInspector.updateSelectedNodeByXPath, updateMode],
  );

  const handleRefresh = useCallback(async () => {
    if (inspectorType === InspectorType.APP) {
      await inspector.updateSources();
    } else {
      await gamiumInspector.handleDumpHierarchy();
    }
  }, [inspectorType, inspector.updateSources, gamiumInspector.handleDumpHierarchy]);

  return (
    <Box>
      <Radio.Group
        value={inspectorType}
        onChange={(e) => updateInspectorType(e.target.value)}
        style={{ marginBottom: '.5rem' }}
      >
        <Radio.Button value={InspectorType.APP}>Native UI</Radio.Button>
        <Radio.Button value={InspectorType.GAME}>Game UI</Radio.Button>
      </Radio.Group>

      {inspectorType === InspectorType.APP && (
        <InspectorContextMenu
          contexts={inspector.contextAndNodes?.map((item) => item.context) ?? []}
          selectedContext={inspector.selectedContextKey}
          onContextChange={inspector.updateSelectedContextKey}
        />
      )}

      <FlexInner>
        {inspectorType === InspectorType.APP && !isContextSelected && (
          <EmptyContextBox>
            <div>
              <InfoCircleOutlined style={{ fontSize: '3rem' }} />
            </div>
            <p style={{ marginTop: '1rem', fontSize: '1rem' }}>
              Select context first for inspecting.
              <br />
              <br />
              <Link
                href="https://docs.dogutech.io/device-farm/device/streaming-and-remote-control/ui-inspector"
                target="_blank"
              >
                Click here
              </Link>{' '}
              for more information.
            </p>
          </EmptyContextBox>
        )}
        <Inner h={55}>
          <InspectorToolbar
            onRefresh={handleRefresh}
            onReset={() => {
              gamiumService?.destroyGamiumClient();
              gamiumService?.initializeGamiumClient();
            }}
            selectDisabled={inspectorType === InspectorType.GAME ? undefined : !isContextSelected}
          />
          <Content>
            <TreeWrapper>
              {inspectorType === InspectorType.APP && (
                <InspectorUITree
                  isInspecting={mode === 'inspect'}
                  treeData={node ? [node] : ([] as DataNode[])}
                  inspectingNode={inspector.inspectingNode}
                  selectedNode={inspector.selectedNode}
                  onClickNode={handleClickAppNode}
                  onHoverNode={inspector.updateInspectingNodeByKey}
                  onLeaveNode={inspector.clearInspectingNode}
                />
              )}
              {inspectorType === InspectorType.GAME && (
                <GamiumInspectorUITree
                  isInspecting={mode === 'inspect'}
                  treeData={gamiumInspector.gamiumTreeNode ?? []}
                  inspectingNode={gamiumInspector.gamiumInspectingNode}
                  selectedNode={gamiumInspector.gamiumSelectedNode}
                  onClickNode={handleClickGameNode}
                  onHoverNode={gamiumInspector.updateInspectingNodeByXPath}
                  onLeaveNode={gamiumInspector.clearInspectingNode}
                />
              )}
            </TreeWrapper>
          </Content>
        </Inner>
        <Inner h={45} style={{ overflow: 'auto' }}>
          {inspectorType === InspectorType.GAME ? (
            <GameObjectDetail node={gamiumInspector.gamiumSelectedNode} hitPoint={gamiumInspector.hitPoint} />
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
