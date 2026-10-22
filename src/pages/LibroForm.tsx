import { useEffect, useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { listarCatalogo } from '../api/catalogos';
import { actualizarLibro, crearLibro, obtenerLibro } from '../api/libros';
import type { Catalogo, Libro } from '../types';

interface Campos {
  titulo: string;
  precio: string;
  disponible: boolean;
  autorId: string;
  generoId: string;
  editorialId: string;
}

interface Datos {
  autores: Catalogo[];
  generos: Catalogo[];
  editoriales: Catalogo[];
  libro?: Libro;
}

interface SelectorProps {
  etiqueta: string;
  opciones: Catalogo[];
  campo: UseFormRegisterReturn;
  error?: string;
}

function Selector({ etiqueta, opciones, campo, error }: SelectorProps) {
  return (
    <label>
      {etiqueta}
      <select {...campo}>
        <option value="">Selecciona...</option>
        {opciones.map((o) => (
          <option key={o.id} value={o.id}>{o.nombre}</option>
        ))}
      </select>
      {error && <span role="alert">{error}</span>}
    </label>
  );
}

function Formulario({ datos, id }: { datos: Datos; id?: string }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { libro } = datos;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Campos>({
    defaultValues: {
      titulo: libro?.titulo ?? '',
      precio: libro ? String(libro.precio) : '',
      disponible: libro?.disponible ?? true,
      autorId: libro ? String(libro.autor.id) : '',
      generoId: libro ? String(libro.genero.id) : '',
      editorialId: libro ? String(libro.editorial.id) : '',
    },
  });

  const onSubmit = async (campos: Campos) => {
    setError('');
    const dto = {
      titulo: campos.titulo.trim(),
      precio: Number(campos.precio),
      disponible: campos.disponible,
      autorId: Number(campos.autorId),
      generoId: Number(campos.generoId),
      editorialId: Number(campos.editorialId),
    };
    try {
      const guardado = id ? await actualizarLibro(Number(id), dto) : await crearLibro(dto);
      navigate(`/libros/${guardado.id}`);
    } catch {
      setError('No se pudo guardar el libro');
    }
  };

  return (
    <main>
      <h1>{id ? 'Editar libro' : 'Nuevo libro'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>
          Título
          <input
            {...register('titulo', {
              required: 'El título es obligatorio',
              validate: (v) => v.trim() !== '' || 'El título es obligatorio',
              maxLength: { value: 255, message: 'Máximo 255 caracteres' },
            })}
          />
          {errors.titulo && <span role="alert">{errors.titulo.message}</span>}
        </label>

        <label>
          Precio
          <input
            type="number"
            min="0"
            step="1"
            {...register('precio', {
              required: 'El precio es obligatorio',
              min: { value: 0, message: 'No puede ser negativo' },
              pattern: { value: /^\d+$/, message: 'Debe ser un número entero' },
            })}
          />
          {errors.precio && <span role="alert">{errors.precio.message}</span>}
        </label>

        <Selector
          etiqueta="Autor"
          opciones={datos.autores}
          campo={register('autorId', { required: 'Selecciona un autor' })}
          error={errors.autorId?.message}
        />
        <Selector
          etiqueta="Editorial"
          opciones={datos.editoriales}
          campo={register('editorialId', { required: 'Selecciona una editorial' })}
          error={errors.editorialId?.message}
        />
        <Selector
          etiqueta="Género"
          opciones={datos.generos}
          campo={register('generoId', { required: 'Selecciona un género' })}
          error={errors.generoId?.message}
        />

        <label>
          <input type="checkbox" {...register('disponible')} />
          Disponible
        </label>

        {error && <p role="alert">{error}</p>}

        <Link to={id ? `/libros/${id}` : '/libros'}>Cancelar</Link>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </main>
  );
}

export default function LibroForm() {
  const { id } = useParams();
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      listarCatalogo('authors'),
      listarCatalogo('genres'),
      listarCatalogo('publishers'),
      id ? obtenerLibro(Number(id)) : undefined,
    ]).then(([autores, generos, editoriales, libro]) => setDatos({ autores, generos, editoriales, libro }))
      .catch(() => setError('No se pudo cargar el formulario'));
  }, [id]);

  if (error) {
    return (
      <main>
        <p role="alert">{error}</p>
        <Link to="/libros">Volver al listado</Link>
      </main>
    );
  }

  if (!datos) return <main><p>Cargando...</p></main>;

  return <Formulario datos={datos} id={id} />;
}