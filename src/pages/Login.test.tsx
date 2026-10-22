import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { login } from '../api/auth';
import Login from './Login';

vi.mock('../api/auth');

const errorHttp = (status: number) =>
  new AxiosError('fallo', undefined, undefined, undefined, { status } as AxiosResponse);

const renderizar = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/libros" element={<p>Listado</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('Login', () => {
  it('exige email y contraseña', async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('El email es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('rechaza un email con formato inválido', async () => {
    const user = userEvent.setup();
    renderizar();
    await user.type(screen.getByLabelText(/email/i), 'no-es-email');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Email no válido')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('guarda el token y navega al listado', async () => {
    vi.mocked(login).mockResolvedValue('token-123');
    const user = userEvent.setup();
    renderizar();
    await user.type(screen.getByLabelText(/email/i), 'admin@admin.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Listado')).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith('admin@admin.com', 'admin123');
    expect(localStorage.getItem('token')).toBe('token-123');
  });

  it('muestra "Credenciales inválidas" ante un 401', async () => {
    vi.mocked(login).mockRejectedValue(errorHttp(401));
    const user = userEvent.setup();
    renderizar();
    await user.type(screen.getByLabelText(/email/i), 'admin@admin.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'mala');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('muestra error de conexión si el servidor no responde', async () => {
    vi.mocked(login).mockRejectedValue(new Error('network'));
    const user = userEvent.setup();
    renderizar();
    await user.type(screen.getByLabelText(/email/i), 'admin@admin.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
      expect(await screen.findByText('No se pudo conectar con el servidor')).toBeInTheDocument();
  });
});