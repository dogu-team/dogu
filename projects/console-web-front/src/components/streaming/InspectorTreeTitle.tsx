import { Dropdown, MenuProps, message } from 'antd';
import { DataNode } from 'antd/es/tree';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import styled from 'styled-components';

interface Props {
  selected?: boolean;
  hovered?: boolean;
  node: DataNode;
  onClickNode: (key: string) => Promise<void> | void;
  onHoverNode: (key: string) => Promise<void> | void;
  onLeaveNode: () => void;
}

const InspectorTreeTitle = ({ selected, hovered, node, onClickNode, onHoverNode, onLeaveNode }: Props) => {
  const { t } = useTranslation();
  const titleBaseStyle: React.CSSProperties = { height: '100%', whiteSpace: 'nowrap' };
  const hoveredStyle: React.CSSProperties = { ...titleBaseStyle, backgroundColor: '#87CEEB66' };
  const selectedStyle: React.CSSProperties = {
    ...titleBaseStyle,
    color: 'red',
    backgroundColor: 'skyblue',
  };

  const menu: MenuProps['items'] = [
    {
      key: 'copy-id',
      label: <StyledMenuItem>Copy XPath</StyledMenuItem>,
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(`${node.key}`);
          message.success(t('common:copyClipboard'));
        } catch (e) {
          message.error(t('common:copyClipboardFailed'));
        }
      },
      style: { padding: '0' },
    },
    {
      key: 'copy-name',
      label: <StyledMenuItem>Copy name</StyledMenuItem>,
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(`${node.title}`);
          message.success('Copied to clipboard');
        } catch (e) {
          message.error(t('common:copyClipboardFailed'));
        }
      },
      style: { padding: '0' },
    },
  ];

  return (
    <Dropdown trigger={['contextMenu']} menu={{ items: menu }}>
      <div
        onClick={() => {
          if (!selected) {
            onClickNode(`${node.key}`);
          }
        }}
        onMouseEnter={() => onHoverNode(`${node.key}`)}
        onMouseLeave={onLeaveNode}
        style={selected ? selectedStyle : hovered ? hoveredStyle : titleBaseStyle}
      >
        {node.title as React.ReactNode}
      </div>
    </Dropdown>
  );
};

export default InspectorTreeTitle;

const StyledMenuItem = styled.div`
  padding: 4px 6px;
  border-radius: 4px;

  &:hover {
    background-color: ${(props) => props.theme.colorPrimary}22;
  }
`;
