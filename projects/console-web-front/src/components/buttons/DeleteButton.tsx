import { Button, ButtonProps, Popconfirm } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

interface Props extends ButtonProps {
  confirmDesc: string;
  onDelete: () => Promise<unknown>;
  icon?: React.ReactNode;
  buttonTitle?: string;
}

const DeleteButton = ({ onDelete, confirmDesc, buttonTitle, ...rest }: Props) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleDelete = async () => {
    setLoading(true);
    await onDelete();
    setLoading(false);
  };

  return (
    <Popconfirm
      title={confirmDesc}
      onConfirm={async (e) => {
        e?.stopPropagation();
        await handleDelete();
      }}
      cancelText={t('common:cancel')}
      okText={t('common:confirm')}
      disabled={rest.disabled || loading}
    >
      <Button danger onClick={(e) => e.stopPropagation()} loading={loading} {...rest}>
        {buttonTitle}
      </Button>
    </Popconfirm>
  );
};

export default DeleteButton;
