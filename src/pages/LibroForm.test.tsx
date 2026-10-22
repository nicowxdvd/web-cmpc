import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listarCatalogo } from '../api/catalogos';
import { actualizarLibro, crearLibro, obtenerLibro } from '../api/libros';
import type { Catalogo, Libro } from '../types';
import LibroForm from './LibroForm';

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

const renderizar = (ruta: string) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/libros/nuevo" element={<LibroForm />} />
        <Route path="/libros/:id/editar" element={<LibroForm />} />
        <Route path="/libros/:id" element={<p>Detalle</p>} />
      </Routes>
    </MemoryRouter>,
  );

const llenar = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/título/i), '  Cien años ');
  await user.type(screen.getByLabelText(/precio/i), '15000');
  await user.selectOptions(screen.getByLabelText(/autor/i), '1');
  await user.selectOptions(screen.getByLabelText(/editorial/i), '3');
  await user.selectOptions(screen.getByLabelText(/género/i), '2');
};

describe('LibroForm', () => {
  beforeEach(() => {
    vi.mocked(listarCatalogo).mockImplementation(async (ruta) => catalogos[ruta]);
  });

  it('muestra los errores si se envía vacío', async () => {
    const user = userEvent.setup();
    renderizar('/libros/nuevo');
    await screen.findByRole('heading', { name: 'Nuevo libro' });
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('El título es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El precio es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un autor')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una editorial')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un género')).toBeInTheDocument();
    expect(crearLibro).not.toHaveBeenCalled();
  });

  it('rechaza un precio decimal', async () => {
    const user = userEvent.setup();
    renderizar('/libros/nuevo');
    await screen.findByRole('heading', { name: 'Nuevo libro' });
    await user.type(screen.getByLabelText(/precio/i), '10.5');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Debe ser un número entero')).toBeInTheDocument();
    expect(crearLibro).not.toHaveBeenCalled();
  });

  it('crea el libro con los datos normalizados y navega al detalle', async () => {
    vi.mocked(crearLibro).mockResolvedValue({ ...libro, id: 9 });
    const user = userEvent.setup();
    renderizar('/libros/nuevo');
    await screen.findByRole('heading', { name: 'Nuevo libro' });
    await llenar(user);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Detalle')).toBeInTheDocument();
    expect(crearLibro).toHaveBeenCalledWith({
      titulo: 'Cien años',
      precio: 15000,
      disponible: true,
      autorId: 1,
      generoId: 2,
      editorialId: 3,
    });
  });

  it('muestra un error si la API falla al guardar', async () => {
    vi.mocked(crearLibro).mockRejectedValue(new Error('fallo'));
    const user = userEvent.setup();
    renderizar('/libros/nuevo');
    await screen.findByRole('heading', { name: 'Nuevo libro' });
    await llenar(user);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('No se pudo guardar el libro')).toBeInTheDocument();
  });

  it('en edición precarga el libro y llama a actualizarLibro', async () => {
    vi.mocked(obtenerLibro).mockResolvedValue(libro);
    vi.mocked(actualizarLibro).mockResolvedValue(libro);
    const user = userEvent.setup();
    renderizar('/libros/5/editar');
    await screen.findByRole('heading', { name: 'Editar libro' });
    expect(screen.getByLabelText(/título/i)).toHaveValue('Rayuela');
    expect(screen.getByLabelText(/precio/i)).toHaveValue(12000);
    expect(screen.getByLabelText(/autor/i)).toHaveValue('1');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Detalle')).toBeInTheDocument();
    expect(actualizarLibro).toHaveBeenCalledWith(5, {
      titulo: 'Rayuela',
      precio: 12000,
      disponible: true,
      autorId: 1,
      generoId: 2,
      editorialId: 3,
    });
  });

  it('muestra un error si no cargan los catálogos', async () => {
    vi.mocked(listarCatalogo).mockRejectedValue(new Error('fallo'));
    renderizar('/libros/nuevo');
    expect(await screen.findByText('No se pudo cargar el formulario')).toBeInTheDocument();
  });
});