// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute({ session }) {
  // Si no hay sesión, redirigimos a la ruta de login
  if (!session) {
    return <Navigate to="/login" replace />
  }

  // Si hay sesión, mostramos el componente hijo (ej. Dashboard)
  return <Outlet />
}