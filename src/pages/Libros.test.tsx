import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listarCatalogo } from '../api/catalogos';
import { listarLibros } from '../api/libros';
import type { Catalogo, Libro } from '../types';
import { formatoPrecio } from '../utils/formato';
import Libros from './Libros';

vi.mock('../api/catalogos');
vi.mock('../api/libros');

const catalogos: Record<'authors' | 'genres' | 'publishers', Catalogo[]> = {
  authors: [{ id: 1, nombre: 'Gabriel García' }],
  genres: [{ id: 2, nombre: 'Novela' }],
  publishers: [{ id: 3, nombre: 'Alfaguara' }],
};

const libro: Libro = {
  id: 5,
  titulo: 'Rayuela',
  precio: 12000,
  disponible: true,
  imgUrl: null,
  autor: catalogos.authors[0],
  genero: catalogos.genres[0],
  editorial: catalogos.publishers[0],
};

const pagina = (data: Libro[], total = data.length) => ({ data, total, page: 1, limit: 10 });

const renderizar = () =>
  render(
    <MemoryRouter>
      <Libros />
    </MemoryRouter>,
  );

describe('Libros', () => {
  beforeEach(() => {
    vi.mocked(listarCatalogo).mockImplementation(async (ruta) => catalogos[ruta]);
    vi.mocked(listarLibros).mockResolvedValue(pagina([libro]));
  });

  it('lista los libros con su precio formateado', async () => {
    renderizar();
    expect(await screen.findByText('Rayuela')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Gabriel García' })).toBeInTheDocument();
    expect(screen.getByText(formatoPrecio(12000))).toBeInTheDocument();
  });

  it('avisa cuando no hay resultados', async () => {
    vi.mocked(listarLibros).mockResolvedValue(pagina([]));
    renderizar();
    expect(await screen.findByText('No hay libros con esos filtros.')).toBeInTheDocument();
  });

  it('muestra un error si falla la carga', async () => {
    vi.mocked(listarLibros).mockRejectedValue(new Error('fallo'));
    renderizar();
    expect(await screen.findByText('No se pudieron cargar los libros')).toBeInTheDocument();
  });

  it('busca con debounce y no consulta por cada tecla', async () => {
    const user = userEvent.setup();
    renderizar();
    await screen.findByText('Rayuela');
    await user.type(screen.getByPlaceholderText('Buscar por título'), 'rayuela');
    expect(listarLibros).not.toHaveBeenCalledWith(expect.objectContaining({ search: 'ray' }));
    await waitFor(() => expect(listarLibros).toHaveBeenCalledWith(expect.objectContaining({ search: 'rayuela' })), {
      timeout: 2000,
    });
  });

  it('pagina contra el servidor', async () => {
    vi.mocked(listarLibros).mockResolvedValue(pagina([libro], 25));
    const user = userEvent.setup();
    renderizar();
    expect(await screen.findByText('Página 1 de 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByText('Página 2 de 3')).toBeInTheDocument();
    expect(listarLibros).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
  });

  it('filtrar por autor consulta con autorId y vuelve a la página 1', async () => {
    vi.mocked(listarLibros).mockResolvedValue(pagina([libro], 25));
    const user = userEvent.setup();
    renderizar();
    await screen.findByText('Página 1 de 3');
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByText('Página 2 de 3');
    await screen.findByRole('option', { name: 'Gabriel García' });
    await user.selectOptions(screen.getByDisplayValue('Todos los autores'), '1');
    await waitFor(() =>
      expect(listarLibros).toHaveBeenLastCalledWith(expect.objectContaining({ autorId: '1', page: 1 })),
    );
  });
});