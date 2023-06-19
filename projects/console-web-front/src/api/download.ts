import { DownloadablePackageResult, PageBase } from '@dogu-private/console';
import api from '.';

export const getLatestDostPackages = async () => {
  const { data } = await api.get<DownloadablePackageResult[]>(`/downloads/dost/latest`);
  return data;
};

export const getAllDostPackages = async (page: number) => {
  const { data } = await api.get<PageBase<DownloadablePackageResult>>(`/downloads/dost?page=${page}&offset=20`);
  return data;
};
