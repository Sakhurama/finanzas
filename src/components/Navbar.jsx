import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Wallet, Menu, X, LogOut, User, Plane } from 'lucide-react';

export default function Navbar({ userName = "Usuario" }) {
const [isOpen, setIsOpen] = useState(false);

const toggleMenu = () => {
    setIsOpen(!isOpen);
};

const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error al cerrar sesión:', error.message);
    // Aquí luego redirigirás a Login
};

return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
        
        {/* Logo y Título (Izquierda) */}
        <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
            <Wallet className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xl font-bold text-slate-900 hidden sm:block">
            Control Financiero
            </span>
        </div>

        {/* Menú de Escritorio (Derecha) - Oculto en móviles */}
        <div className="hidden md:flex items-center gap-6">
            
            {/* Nueva opción: Planificar Viajes (Simulada) */}
            <button 
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            title="Próximamente"
            >
            <Plane className="w-4 h-4" />
            Planificar Viajes
            </button>

            <div className="h-6 w-px bg-slate-200"></div> {/* Separador vertical */}

            <div className="flex items-center gap-2 text-slate-600">
            <div className="bg-slate-100 p-1.5 rounded-full">
                <User className="w-4 h-4 text-slate-500" />
            </div>
            <span className="font-medium text-sm">{userName}</span>
            </div>
            
            <div className="h-6 w-px bg-slate-200"></div> {/* Separador vertical */}
            
            <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
            >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
            </button>
        </div>

        {/* Botón Menú Móvil (Derecha) - Visible solo en móviles */}
        <div className="md:hidden flex items-center">
            <button 
            onClick={toggleMenu}
            className="text-slate-500 hover:text-slate-700 focus:outline-none p-2"
            >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>

        </div>
    </div>

    {/* Menú Móvil Acordeón - Se muestra si isOpen es true */}
    <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-72 border-t border-slate-100' : 'max-h-0'
        }`}
    >
        <div className="px-4 py-4 space-y-4 bg-slate-50">
        
        {/* Info del usuario en móvil */}
        <div className="flex items-center gap-3 text-slate-700 px-2 mb-2">
            <div className="bg-slate-200 p-2 rounded-full">
            <User className="w-5 h-5 text-slate-600" />
            </div>
            <div>
            <p className="text-xs text-slate-400">Sesión iniciada como</p>
            <p className="font-semibold text-sm">{userName}</p>
            </div>
        </div>

        <div className="h-px w-full bg-slate-200"></div> {/* Separador móvil */}

        {/* Botón Planificar Viajes móvil */}
        <button 
            className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm shadow-sm"
        >
            <Plane className="w-4 h-4 text-indigo-500" />
            Planificar Viajes
        </button>

        {/* Botón cerrar sesión móvil */}
        <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-rose-100 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors font-medium text-sm shadow-sm"
        >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
        </button>

        </div>
    </div>
    </nav>
);
}