import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DOGU_API_BASE_URL,
  withCredentials: true,
});

export const swrAuthFetcher = async (key: string) => {
  const data = await api.get(key);
  return data.data;
};

export default api;
