import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { login } from '../api/auth';

interface Campos {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Campos>();

  const onSubmit = async ({ email, password }: Campos) => {
    setError('');
    try {
      const token = await login(email, password);
      localStorage.setItem('token', token);
      navigate('/libros');
    } catch (e) {
      const credenciales = isAxiosError(e) && e.response?.status === 401;
      setError(credenciales ? 'Credenciales inválidas' : 'No se pudo conectar con el servidor');
    }
  };

  return (
    <main className="login">
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>
          Email
          <input
            type="email"
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email no válido' },
            })}
          />
          {errors.email && <span role="alert">{errors.email.message}</span>}
        </label>

        <label>
          Contraseña
          <input
            type="password"
            {...register('password', { required: 'La contraseña es obligatoria' })}
          />
          {errors.password && <span role="alert">{errors.password.message}</span>}
        </label>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}