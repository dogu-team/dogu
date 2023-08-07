import { Button, ButtonProps } from 'antd';

interface Props extends Omit<ButtonProps, 'type' | 'danger'> {}

const DisconnectButton = (props: Props) => {
  return <Button {...props} type="text" danger />;
};

export default DisconnectButton;
