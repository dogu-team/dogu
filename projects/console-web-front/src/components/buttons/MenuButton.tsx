import { EllipsisOutlined } from '@ant-design/icons';
import { Button, Dropdown, DropdownProps, MenuProps } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';

interface Props extends DropdownProps {}

const MenuButton = (props: Props) => {
  const items: MenuProps['items'] = props.menu?.items?.map((item) => ({ ...item, style: { padding: '0' } } as ItemType));

  return (
    <Box>
      <Dropdown {...props} menu={{ ...props.menu, items }} trigger={['click']}>
        <Button type="text" icon={<EllipsisOutlined style={{ fontSize: '1.1rem' }} />} access-id="list-menu-btn" />
      </Dropdown>
    </Box>
  );
};

export default MenuButton;

const Box = styled.div`
  ${flexRowBaseStyle}
`;
