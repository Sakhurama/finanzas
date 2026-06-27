import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import FilaRegistro from './FilaRegistro';

export default function GestorDeudasReales({ realDebts, newRealDebt, setNewRealDebt, handleAddRealDebt, removeRealDebt, updateRealDebt, formatCurrency }) {
      const [displayValue, setDisplayValue] = useState('');

      const handleChange = (e) => {
      // 1. Capturamos el valor y eliminamos cualquier cosa que no sea un dígito (\D)
      const inputValue = e.target.value;
      const numericString = inputValue.replace(/\D/g, '');

      // 2. Si el input queda vacío, limpiamos ambos estados
      if (numericString === '') {
        setDisplayValue('');
        setNewRealDebt({...newRealDebt, amount: ''});
        return;
      }

      // 3. Formateamos el string numérico a formato de pesos (con puntos para miles)
      const formatter = new Intl.NumberFormat('es-CO');
      const formattedNumber = formatter.format(parseInt(numericString, 10));

      // 4. Actualizamos los estados
      setNewRealDebt({...newRealDebt, amount: numericString});
      setDisplayValue(formattedNumber);
    };

    const handleSubmit = (e) => {
      handleAddRealDebt(e);
      setDisplayValue('');
    };


  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-violet-600 mb-1 border-b border-slate-100 pb-2">
        Mis Deudas <span className="text-xs font-normal text-slate-400">(cuota mensual)</span>
      </h3>
      <p className="text-xs text-slate-400 mb-4 mt-2">Préstamos, tarjetas y créditos. Registra el pago mensual.</p>

      {/* Formulario Nueva Deuda */}
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Ej. Cuota tarjeta"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={newRealDebt.name}
          onChange={(e) => setNewRealDebt({...newRealDebt, name: e.target.value})}
        />
        <input
          type="text"
          placeholder="$300.000"
          className="w-full lg:w-1/3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={displayValue}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full lg:w-auto bg-violet-500 hover:bg-violet-600 text-white p-2 rounded-lg transition-colors"
          disabled={!newRealDebt.name || !newRealDebt.amount}
        >
          <Plus className="w-auto h-5" />
          <span className="font-bold lg:hidden">Agregar</span>
        </button>
      </form>

      {/* Lista de Deudas */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {realDebts.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">No hay deudas registradas</p>
        ) : (
          realDebts.map(debt => (
            <FilaRegistro
              key={debt.id}
              item={debt}
              color="violet"
              onUpdate={updateRealDebt}
              onRemove={removeRealDebt}
              formatCurrency={formatCurrency}
            />
          ))
        )}
      </div>
    </div>
  );
}
