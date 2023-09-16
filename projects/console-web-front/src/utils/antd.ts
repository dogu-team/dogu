import { notification } from 'antd';

export const sendSuccessNotification = (message: string) =>
  notification.success({ message, placement: 'bottomRight', style: { whiteSpace: 'pre-wrap' } });

export const sendErrorNotification = (message: string) =>
  notification.error({ message, placement: 'bottomRight', style: { whiteSpace: 'pre-wrap' } });
