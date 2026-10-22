import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import Libros from './pages/Libros';
import LibroDetalle from './pages/LibroDetalle';
import LibroForm from './pages/LibroForm';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RutaProtegida />}>
          <Route path="/libros" element={<Libros />} />
          <Route path="/libros/nuevo" element={<LibroForm />} />
          <Route path="/libros/:id" element={<LibroDetalle />} />
          <Route path="/libros/:id/editar" element={<LibroForm />} />
        </Route>
        <Route path="*" element={<Navigate to="/libros" replace />} />
      </Routes>
    </BrowserRouter>
  );
}