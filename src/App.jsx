import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

// 1. Importamos tus Pantallas (Pages)
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// 2. Importamos el componente Guardia (lo crearemos en el siguiente paso si no lo tienes)
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [session, setSession] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Al cargar la app, verificamos si ya hay una sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setCargando(false)
    })

    // Escuchamos los cambios (si el usuario inicia o cierra sesión)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Mientras verificamos la sesión, mostramos una pantalla de carga
  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <h2>Cargando...</h2>
      </div>
    )
  }

  // 3. Configuramos el enrutador
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA: El Login */}
        {/* Si ya hay sesión, no lo dejamos ver el login, lo mandamos al dashboard */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/dashboard" replace />} 
        />

        {/* RUTAS PRIVADAS: Protegidas por nuestro componente guardia */}
        <Route element={<ProtectedRoute session={session} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Si en el futuro creas /perfil, lo agregarías aquí adentro */}
        </Route>

        {/* RUTA COMODÍN (Catch-all): Si escribe cualquier otra cosa en la URL */}
        <Route 
          path="*" 
          element={<Navigate to={session ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App