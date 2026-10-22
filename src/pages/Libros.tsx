import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { exportarCsv, listarLibros } from '../api/libros';
import { listarCatalogo } from '../api/catalogos';
import { useDebounce } from '../hooks/useDebounce';
import type { Catalogo, FiltrosLibros, PaginaLibros } from '../types';
import { formatoPrecio } from '../utils/formato';

const filtrosIniciales: FiltrosLibros = {
  page: 1,
  limit: 10,
  search: '',
  autorId: '',
  generoId: '',
  editorialId: '',
  disponible: '',
  orderBy: 'id',
  order: 'desc',
};

const ordenes = [
  { valor: 'id:desc', texto: 'Más recientes' },
  { valor: 'id:asc', texto: 'Más antiguos' },
  { valor: 'titulo:asc', texto: 'Título A-Z' },
  { valor: 'titulo:desc', texto: 'Título Z-A' },
  { valor: 'precio:asc', texto: 'Precio menor' },
  { valor: 'precio:desc', texto: 'Precio mayor' },
];

export default function Libros() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const search = useDebounce(busqueda);
  const [resultado, setResultado] = useState<{ params: FiltrosLibros; pagina: PaginaLibros } | null>(null);
  const [error, setError] = useState('');
  const [catalogos, setCatalogos] = useState<{ autores: Catalogo[]; generos: Catalogo[]; editoriales: Catalogo[] }>({
    autores: [],
    generos: [],
    editoriales: [],
  });

  const params = useMemo(() => ({ ...filtros, search }), [filtros, search]);
  const cargando = resultado?.params !== params;
  const libros = resultado?.pagina.data ?? [];
  const totalPaginas = Math.max(1, Math.ceil((resultado?.pagina.total ?? 0) / filtros.limit));

  useEffect(() => {
    Promise.all([
      listarCatalogo('authors'), 
      listarCatalogo('genres'), 
      listarCatalogo('publishers')]
    ).then(([autores, generos, editoriales]) => setCatalogos({ autores, generos, editoriales }))
     .catch(() => setError('No se pudieron cargar los filtros'));
  }, []);

  useEffect(() => {
    let vigente = true;
    listarLibros(params).then((pagina) => {
        if (!vigente) return;
        setResultado({ params, pagina });
        setError('');
      }).catch(() => {
        if (vigente) setError('No se pudieron cargar los libros');
      });
    return () => {
      vigente = false;
    };
  }, [params]);

  const cambiar = (cambio: Partial<FiltrosLibros>) => setFiltros((f) => ({ ...f, ...cambio, page: 1 }));

  const cambiarOrden = (valor: string) => {
    const [orderBy, order] = valor.split(':') as [FiltrosLibros['orderBy'], FiltrosLibros['order']];
    cambiar({ orderBy, order });
  };

  const buscar = (valor: string) => {
    setBusqueda(valor);
    setFiltros((f) => (f.page === 1 ? f : { ...f, page: 1 }));
  };

  const irAPagina = (page: number) => setFiltros((f) => ({ ...f, page }));

  const descargar = async () => {
    try {
      const blob = await exportarCsv(params);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = 'libros.csv';
      enlace.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo exportar el CSV');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <main>
      <header>
        <h1>Libros</h1>
        <Link to="/libros/nuevo">Nuevo libro</Link>
        <button onClick={descargar}>Exportar CSV</button>
        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </header>

      <section>
        <input
          type="search"
          placeholder="Buscar por título"
          value={busqueda}
          onChange={(e) => buscar(e.target.value)}
        />

        <select value={filtros.autorId} onChange={(e) => cambiar({ autorId: e.target.value })}>
          <option value="">Todos los autores</option>
          {catalogos.autores.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>

        <select value={filtros.generoId} onChange={(e) => cambiar({ generoId: e.target.value })}>
          <option value="">Todos los géneros</option>
          {catalogos.generos.map((g) => (
            <option key={g.id} value={g.id}>{g.nombre}</option>
          ))}
        </select>

        <select value={filtros.editorialId} onChange={(e) => cambiar({ editorialId: e.target.value })}>
          <option value="">Todas las editoriales</option>
          {catalogos.editoriales.map((ed) => (
            <option key={ed.id} value={ed.id}>{ed.nombre}</option>
          ))}
        </select>

        <select value={filtros.disponible} onChange={(e) => cambiar({ disponible: e.target.value })}>
          <option value="">Cualquier disponibilidad</option>
          <option value="true">Disponibles</option>
          <option value="false">No disponibles</option>
        </select>

        <select value={`${filtros.orderBy}:${filtros.order}`} onChange={(e) => cambiarOrden(e.target.value)}>
          {ordenes.map((o) => (
            <option key={o.valor} value={o.valor}>{o.texto}</option>
          ))}
        </select>
      </section>

      {error && <p role="alert">{error}</p>}
      {cargando && !error && <p>Cargando...</p>}
      {!cargando && libros.length === 0 && <p>No hay libros con esos filtros.</p>}

      {libros.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Editorial</th>
              <th>Género</th>
              <th>Precio</th>
              <th>Disponible</th>
            </tr>
          </thead>
          <tbody>
            {libros.map((l) => (
              <tr key={l.id}>
                <td><Link to={`/libros/${l.id}`}>{l.titulo}</Link></td>
                <td>{l.autor.nombre}</td>
                <td>{l.editorial.nombre}</td>
                <td>{l.genero.nombre}</td>
                <td>{formatoPrecio(l.precio)}</td>
                <td>{l.disponible ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <footer>
        <button disabled={filtros.page <= 1} onClick={() => irAPagina(filtros.page - 1)}>Anterior</button>
        <span>Página {filtros.page} de {totalPaginas}</span>
        <button disabled={filtros.page >= totalPaginas} onClick={() => irAPagina(filtros.page + 1)}>Siguiente</button>
      </footer>
    </main>
  );
}