import { api } from './client';
import type { Catalogo } from '../types';

export const listarCatalogo = async (ruta: 'authors' | 'genres' | 'publishers') => {
  const { data } = await api.get<Catalogo[]>(`/${ruta}`);
  return data;
};