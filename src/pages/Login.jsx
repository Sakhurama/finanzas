import React, { useState } from 'react';
import { Wallet, Mail, Lock, LogIn, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Login({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false); // Estado para alternar entre login y registro
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

  // Función para registrar un nuevo usuario
  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, verifica.');
      return;
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  // Función para iniciar sesión con un usuario existente
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <>
    {isSignUp ? (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-10">
              <Wallet className="w-40 h-40 text-white" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white p-3 rounded-2xl shadow-sm mb-4">
                <Wallet className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-white">Crear Cuenta</h2>
              <p className="text-emerald-200 mt-2 text-sm">
                Únete a nuestra comunidad financiera
              </p>
            </div>
          </div>

          <div className="p-8">

            {error && (
            <div className="mb-4 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-rose-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Campo Confirmar Contraseña */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Botón de Submit */}
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-6"
              >
                <LogIn className="w-5 h-5" />
                Crear Cuenta
              </button>
            </form>

            {/* Separador */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">¿Ya tienes cuenta?</span>
              </div>
            </div>

            {/* Botón Volver a Login */}
            <div className="mt-6">
              <button
                onClick={() => setIsSignUp(false)}
                type="button"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                Volver al Login
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-400">
          © 2026 Mi Control Financiero. Todos los derechos reservados.
        </p>
      </div>
    ) : (
    
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      
      {/* Contenedor principal */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Encabezado del Login */}
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Wallet className="w-40 h-40 text-white" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-3 rounded-2xl shadow-sm mb-4">
              <Wallet className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-white">Bienvenido de nuevo</h2>
            <p className="text-indigo-200 mt-2 text-sm">
              Ingresa a tu Control Financiero
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* <div className="flex justify-end mt-2">
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div> */}
            </div>

            {/* Botón de Submit */}
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-6"
            >
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </button>
          </form>

          {/* Separador */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">¿No tienes cuenta?</span>
            </div>
          </div>

          {/* Botón Crear Cuenta */}
          <div className="mt-6">
            <button
              onClick={() => setIsSignUp(true)}
              type="button"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Crear una cuenta nueva
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer simple */}
      <p className="mt-8 text-sm text-slate-400">
        © 2026 Mi Control Financiero. Todos los derechos reservados.
      </p>
    </div>
    )}
    
    </>
  );
}