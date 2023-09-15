import api from '.';

export const hasRootUser = async (): Promise<boolean> => {
  const { data } = await api.get<boolean>('/feature/root-user');
  return data;
};
