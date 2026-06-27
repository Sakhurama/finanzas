import React from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import InputPesos from './InputPesos';
import FilaRegistro from './FilaRegistro';

export default function GestorIngresos({ incomes, newIncome, setNewIncome, handleAddIncome, removeIncome, updateIncome, formatCurrency, guardarRegistro }) {

    const [displayValue, setDisplayValue] = useState('');

    const handleChange = (e) => {
    // 1. Capturamos el valor y eliminamos cualquier cosa que no sea un dígito (\D)
    const inputValue = e.target.value;
    const numericString = inputValue.replace(/\D/g, '');

    // 2. Si el input queda vacío, limpiamos ambos estados
    if (numericString === '') {
      setDisplayValue('');
      setNewIncome({...newIncome, amount: ''});
      return;
    }

    // 3. Formateamos el string numérico a formato de pesos (con puntos para miles)
    const formatter = new Intl.NumberFormat('es-CO');
    const formattedNumber = formatter.format(parseInt(numericString, 10));

    // 4. Actualizamos los estados
    setNewIncome({...newIncome, amount: numericString});
    setDisplayValue(formattedNumber);
  };

  const handleSubmit = (e) => {
    handleAddIncome(e);
    setDisplayValue('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-emerald-600 mb-4 border-b border-slate-100 pb-2">Mis Ingresos</h3>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Ej. Salario" 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={newIncome.name}
          onChange={(e) => setNewIncome({...newIncome, name: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="$1.100.000" 
          className="w-full lg:w-1/3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={displayValue}
          onChange={handleChange}
        />
        <button 
          type="submit" 
          className="flex items-center justify-center gap-2 w-full lg:w-auto bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors"
          disabled={!newIncome.name || !newIncome.amount}
        >
          <Plus className="w-auto h-5" />
          <span className="font-bold lg:hidden">Agregar</span>
        </button>
      </form>

      {/* Lista de Ingresos */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {incomes.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">No hay ingresos registrados</p>
        ) : (
          incomes.map(income => (
            <FilaRegistro
              key={income.id}
              item={income}
              color="emerald"
              onUpdate={updateIncome}
              onRemove={removeIncome}
              formatCurrency={formatCurrency}
            />
          ))
        )}
      </div>
    </div>
  );
}
