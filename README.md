# web-cmpc

Frontend de la gestión de libros de CMPC. React + TypeScript + Vite.

## Requisitos

- Docker, o Node 24 para el modo desarrollo
- La API de `api-cmpc` debe estar corriendo en `http://localhost:3000`

## Con Docker

Tanto la web como la api, estan configuradas para cuando se corra el comando docker compose, queden arriba los servicios.
Con el fin de llegar y testearlos. Pero ademas adjunto los comandos para una revision en desarrollo

```bash
docker compose up -d --build
```

La web queda en `http://localhost:5173`

NOTA: Importante! Correr el seed que esta en la api, leer atentamente el readme.


## Login

`admin@admin.com` / `admin123`

## Guia de uso de la web

1.- pantalla de inicio, ingresar correo y contraseña (`admin@admin.com` / `admin123`)
2.- En el Home, esquina superior derecha se encuentran las opciones de 
    * Ingresar nuevo libro
    * exportar csv
    * Cerrar session

 2.1.- Ingresar nuevo libro, pantalla con formulario para ingresar. Tambien esta la opcion de cancelar, que redirige al home
 2.2.- Exportar csv, da la opcion de descargar un csv con el listado de libros.
 2.3.- Cerrar sesion.

3.- La barra de filtros, permite filtro por buscador, autores, disponibilidad, generos y editoriales
4.- La opcion de ordenar, entrega opcion alfabeticamente, por precio y fecha
5.- Tabla de libros
    5.1.- Para ver el detalle de libros, se debe hacer click en el titulo (Link)
    5.2.- En el detalle del libro, esquina superior derecha tiene 3 opciones
        5.2.1.- Volver al listado inicial
        5.3.1.- Editar el libro
        5.3.4.- Eliminar el libro
6.- Paginacion, al final de la tabla de libros se encuentra la paginación

## ############ Modo desarrollo ####################

```bash
npm install
cp .env.example .env
npm run dev
```

## Variable de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL de la API (por defecto `http://localhost:3000`) |

## Scripts

- `npm run dev`: desarrollo
- `npm run build`: compilar
- `npm test`: tests
- `npm run lint`: linter

### #################################################