import { AxiosError } from 'axios';

export const getErrorMessageFromAxios = (e: AxiosError<{ message: string }>): string => {
  if (e.response?.status === 500) {
    return 'Please retry later. If the problem persists, please send feedback or contact us.';
  }

  return e.response?.data?.message ? JSON.stringify(e.response.data.message) : 'REQUEST FAILED';
};
