import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import FilaRegistro from './FilaRegistro';

export default function GestorDeudas({ debts, newDebt, setNewDebt, handleAddDebt, removeDebt, updateDebt, formatCurrency, onToggle, onToggleAll }) {
      const todosActivos = debts.length > 0 && debts.every(d => d.activo !== false);

      const [displayValue, setDisplayValue] = useState('');
  
      const handleChange = (e) => {
      // 1. Capturamos el valor y eliminamos cualquier cosa que no sea un dígito (\D)
      const inputValue = e.target.value;
      const numericString = inputValue.replace(/\D/g, '');
  
      // 2. Si el input queda vacío, limpiamos ambos estados
      if (numericString === '') {
        setDisplayValue('');
        setNewDebt({...newDebt, amount: ''});
        return;
      }
  
      // 3. Formateamos el string numérico a formato de pesos (con puntos para miles)
      const formatter = new Intl.NumberFormat('es-CO');
      const formattedNumber = formatter.format(parseInt(numericString, 10));
  
      // 4. Actualizamos los estados
      setNewDebt({...newDebt, amount: numericString});
      setDisplayValue(formattedNumber);
    };
  
    const handleSubmit = (e) => {
      handleAddDebt(e);
      setDisplayValue('');
    };


  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
        <h3 className="text-lg font-bold text-rose-600">Mis Gastos Fijos</h3>
        {debts.length > 0 && (
          <button
            type="button"
            onClick={() => onToggleAll(!todosActivos)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            {todosActivos ? 'Desactivar todo' : 'Activar todo'}
          </button>
        )}
      </div>

      {/* Formulario Nueva Deuda */}
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Ej. Arriendo" 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          value={newDebt.name}
          onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="$500.000" 
          className="w-full lg:w-1/3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          value={displayValue}
          onChange={handleChange}
        />
        <button 
          type="submit" 
          className="flex items-center justify-center gap-2 w-full lg:w-auto bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-lg transition-colors"
          disabled={!newDebt.name || !newDebt.amount}
        >
          <Plus className="w-auto h-5" />
          <span className="font-bold lg:hidden">Agregar</span>
        </button>
      </form>

      {/* Lista de Deudas */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {debts.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">No hay deudas registradas</p>
        ) : (
          debts.map(debt => (
            <FilaRegistro
              key={debt.id}
              item={debt}
              color="rose"
              onUpdate={updateDebt}
              onRemove={removeDebt}
              formatCurrency={formatCurrency}
              onToggle={onToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}
