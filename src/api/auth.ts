import { api } from './client';

export const login = async (email: string, password: string) => {
  const { data } = await api.post<{ accessToken: string }>('/auth/login', { email, password });
  return data.accessToken;
};