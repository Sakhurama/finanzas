import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import FilaRegistro from './FilaRegistro';

export default function GestorGastosVariables({ variableExpenses, newVariableExpense, setNewVariableExpense, handleAddVariableExpense, removeVariableExpense, updateVariableExpense, formatCurrency }) {
      const [displayValue, setDisplayValue] = useState('');

      const handleChange = (e) => {
      // 1. Capturamos el valor y eliminamos cualquier cosa que no sea un dígito (\D)
      const inputValue = e.target.value;
      const numericString = inputValue.replace(/\D/g, '');

      // 2. Si el input queda vacío, limpiamos ambos estados
      if (numericString === '') {
        setDisplayValue('');
        setNewVariableExpense({...newVariableExpense, amount: ''});
        return;
      }

      // 3. Formateamos el string numérico a formato de pesos (con puntos para miles)
      const formatter = new Intl.NumberFormat('es-CO');
      const formattedNumber = formatter.format(parseInt(numericString, 10));

      // 4. Actualizamos los estados
      setNewVariableExpense({...newVariableExpense, amount: numericString});
      setDisplayValue(formattedNumber);
    };

    const handleSubmit = (e) => {
      handleAddVariableExpense(e);
      setDisplayValue('');
    };


  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-amber-600 mb-4 border-b border-slate-100 pb-2">Mis Gastos Variables</h3>

      {/* Formulario Nuevo Gasto Variable */}
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Ej. Tenis nuevos"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          value={newVariableExpense.name}
          onChange={(e) => setNewVariableExpense({...newVariableExpense, name: e.target.value})}
        />
        <input
          type="text"
          placeholder="$150.000"
          className="w-full lg:w-1/3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          value={displayValue}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full lg:w-auto bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-lg transition-colors"
          disabled={!newVariableExpense.name || !newVariableExpense.amount}
        >
          <Plus className="w-auto h-5" />
          <span className="font-bold lg:hidden">Agregar</span>
        </button>
      </form>

      {/* Lista de Gastos Variables */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {variableExpenses.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">No hay gastos variables registrados</p>
        ) : (
          variableExpenses.map(expense => (
            <FilaRegistro
              key={expense.id}
              item={expense}
              color="amber"
              onUpdate={updateVariableExpense}
              onRemove={removeVariableExpense}
              formatCurrency={formatCurrency}
            />
          ))
        )}
      </div>
    </div>
  );
}
