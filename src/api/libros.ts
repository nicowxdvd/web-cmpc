import { api } from './client';
import type { FiltrosLibros, Libro, LibroInput, PaginaLibros } from '../types';

const limpiar = (filtros: FiltrosLibros) => Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor !== ''));

export const listarLibros = async (filtros: FiltrosLibros) => {
  const { data } = await api.get<PaginaLibros>('/books', { params: limpiar(filtros) });
  return data;
};

export const exportarCsv = async (filtros: FiltrosLibros) => {
  const { data } = await api.get<Blob>('/books/export/csv', {
    params: limpiar(filtros),
    responseType: 'blob',
  });
  return data;
};

export const obtenerLibro = async (id: number) => {
  const { data } = await api.get<Libro>(`/books/${id}`);
  return data;
};

export const crearLibro = async (libro: LibroInput) => {
  const { data } = await api.post<Libro>('/books', libro);
  return data;
};

export const actualizarLibro = async (id: number, libro: LibroInput) => {
  const { data } = await api.patch<Libro>(`/books/${id}`, libro);
  return data;
};

export const eliminarLibro = async (id: number) => {
  await api.delete(`/books/${id}`);
};