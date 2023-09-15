import { AxiosError } from 'axios';

export const isPaymentRequired = (e: AxiosError): boolean => {
  return e.response?.status === 402;
};

export const isTimeout = (e: AxiosError): boolean => {
  return e.response?.status === 408;
};
