import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { eliminarLibro, obtenerLibro } from '../api/libros';
import { formatoPrecio } from '../utils/formato';
import type { Libro } from '../types';

export default function LibroDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [libro, setLibro] = useState<Libro | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerLibro(Number(id))
      .then(setLibro)
      .catch((e) => {
        const noExiste = isAxiosError(e) && e.response?.status === 404;
        setError(noExiste ? 'Libro no encontrado' : 'No se pudo cargar el libro');
      });
  }, [id]);

  if (error) {
    return (
      <main>
        <p role="alert">{error}</p>
        <Link to="/libros">Volver al listado</Link>
      </main>
    );
  }

  if (!libro) return <main><p>Cargando...</p></main>;

  const eliminar = async () => {
    if (!window.confirm('¿Eliminar este libro?')) return;
    try {
      await eliminarLibro(libro.id);
      navigate('/libros');
    } catch {
      setError('No se pudo eliminar el libro');
    }
  };

  return (
    <main>
      <header>
        <h1>{libro.titulo}</h1>
        <Link to="/libros">Volver</Link>
        <Link to={`/libros/${libro.id}/editar`}>Editar</Link>
        <button onClick={eliminar}>Eliminar</button>
      </header>

      <dl>
        <dt>Autor</dt>
        <dd>{libro.autor.nombre}</dd>
        <dt>Editorial</dt>
        <dd>{libro.editorial.nombre}</dd>
        <dt>Género</dt>
        <dd>{libro.genero.nombre}</dd>
        <dt>Precio</dt>
        <dd>{formatoPrecio(libro.precio)}</dd>
        <dt>Disponible</dt>
        <dd>{libro.disponible ? 'Sí' : 'No'}</dd>
      </dl>
    </main>
  );
}