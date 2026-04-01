import React from 'react';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import InputPesos from './InputPesos';

export default function GestorIngresos({ incomes, newIncome, setNewIncome, handleAddIncome, removeIncome, formatCurrency, guardarRegistro }) {

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

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Ej. Salario" 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={newIncome.name}
          onChange={(e) => setNewIncome({...newIncome, name: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Monto" 
          className="w-1/3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={displayValue}
          onChange={handleChange}
        />
        <button 
          type="submit" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors"
          disabled={!newIncome.name || !newIncome.amount}
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Lista de Ingresos */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {incomes.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">No hay ingresos registrados</p>
        ) : (
          incomes.map(income => (
            <div key={income.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
              <span className="font-medium text-slate-700">{income.concepto}</span>
              <div className="flex items-center gap-4">
                <span className="text-emerald-600 font-semibold">{formatCurrency(income.monto)}</span>
                <button type="button" onClick={() => removeIncome(income.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
