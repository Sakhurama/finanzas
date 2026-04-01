import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function GestorDeudas({ debts, newDebt, setNewDebt, handleAddDebt, removeDebt, formatCurrency }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-rose-600 mb-4 border-b border-slate-100 pb-2">Mis Deudas Fijas</h3>
      
      {/* Formulario Nueva Deuda */}
      <form onSubmit={handleAddDebt} className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Ej. Alquiler" 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          value={newDebt.name}
          onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
        />
        <input 
          type="number" 
          placeholder="Monto" 
          className="w-1/3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          value={newDebt.amount}
          onChange={(e) => setNewDebt({...newDebt, amount: e.target.value})}
        />
        <button 
          type="submit" 
          className="bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-lg transition-colors"
          disabled={!newDebt.name || !newDebt.amount}
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Lista de Deudas */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {debts.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">No hay deudas registradas</p>
        ) : (
          debts.map(debt => (
            <div key={debt.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
              <span className="font-medium text-slate-700">{debt.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-rose-600 font-semibold">{formatCurrency(debt.amount)}</span>
                <button type="button" onClick={() => removeDebt(debt.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
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
