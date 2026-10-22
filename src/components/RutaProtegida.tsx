import { Navigate, Outlet } from 'react-router-dom';

export default function RutaProtegida() {
  return localStorage.getItem('token') ? <Outlet /> : <Navigate to="/login" replace />;
}