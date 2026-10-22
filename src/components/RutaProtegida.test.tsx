import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RutaProtegida from './RutaProtegida';

const renderizar = () =>
  render(
    <MemoryRouter initialEntries={['/libros']}>
      <Routes>
        <Route path="/login" element={<p>Pantalla login</p>} />
        <Route element={<RutaProtegida />}>
          <Route path="/libros" element={<p>Contenido privado</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('RutaProtegida', () => {
  it('redirige a /login si no hay token', () => {
    renderizar();
    expect(screen.getByText('Pantalla login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('muestra el contenido si hay token', () => {
    localStorage.setItem('token', 'abc');
    renderizar();
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });
});