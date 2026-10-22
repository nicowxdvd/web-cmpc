export interface Catalogo {
  id: number;
  nombre: string;
}

export interface Libro {
  id: number;
  titulo: string;
  precio: number;
  disponible: boolean;
  imgUrl: string | null;
  autor: Catalogo;
  genero: Catalogo;
  editorial: Catalogo;
}

export interface PaginaLibros {
  data: Libro[];
  total: number;
  page: number;
  limit: number;
}

export interface FiltrosLibros {
  page: number;
  limit: number;
  search: string;
  autorId: string;
  generoId: string;
  editorialId: string;
  disponible: string;
  orderBy: 'titulo' | 'precio' | 'id';
  order: 'asc' | 'desc';
}

export interface LibroInput {
  titulo: string;
  precio: number;
  disponible: boolean;
  autorId: number;
  generoId: number;
  editorialId: number;
}
