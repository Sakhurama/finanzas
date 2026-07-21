import React, { useState } from 'react';
import { Plus, Receipt, Share2, Copy, Check } from 'lucide-react';
import FilaGastoViaje from './FilaGastoViaje';
import { totalViaje } from '../utils/viajes';

// Gestor de los gastos del viaje activo: formulario para añadir un gasto
// (concepto, monto y si se repite por día) y lista editable de gastos.
export default function GestorGastosViaje({
  gastos,
  dias,
  newGasto,
  setNewGasto,
  handleAddGasto,
  removeGasto,
  updateGasto,
  onCompartir,
  puedeCompartir,
  formatCurrency,
}) {
  const [displayValue, setDisplayValue] = useState('');
  const [copiado, setCopiado] = useState(false);

  const handleCompartir = async () => {
    const ok = await onCompartir();
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleChange = (e) => {
    const numericString = e.target.value.replace(/\D/g, '');
    if (numericString === '') {
      setDisplayValue('');
      setNewGasto({ ...newGasto, amount: '' });
      return;
    }
    const formattedNumber = new Intl.NumberFormat('es-CO').format(parseInt(numericString, 10));
    setNewGasto({ ...newGasto, amount: numericString });
    setDisplayValue(formattedNumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newGasto.name.trim() || !newGasto.amount) return;
    await handleAddGasto();
    setDisplayValue('');
  };

  const total = totalViaje(gastos, dias);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-lg font-bold text-sky-600">
          <Receipt className="w-5 h-5" />
          Gastos del viaje
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-500 whitespace-nowrap">
            Total: {formatCurrency(total)}
          </span>
          <button
            type="button"
            onClick={handleCompartir}
            disabled={gastos.length === 0}
            title={
              puedeCompartir
                ? 'Compartir los gastos en Markdown por chat'
                : 'Copiar los gastos en Markdown para pegarlos en un chat'
            }
            className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:hover:bg-sky-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {copiado ? (
              <Check className="w-4 h-4" />
            ) : puedeCompartir ? (
              <Share2 className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {copiado ? '¡Copiado!' : puedeCompartir ? 'Compartir' : 'Copiar'}
            </span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6">
        <div className="flex flex-col lg:flex-row gap-2">
          <input
            type="text"
            placeholder="Ej. Souvenirs"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={newGasto.name}
            onChange={(e) => setNewGasto({ ...newGasto, name: e.target.value })}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="$50.000"
            className="w-full lg:w-1/3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={displayValue}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full lg:w-auto bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
            disabled={!newGasto.name.trim() || !newGasto.amount}
          >
            <Plus className="w-auto h-5" />
            <span className="font-bold lg:hidden">Agregar gasto</span>
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={newGasto.porDia}
            onChange={(e) => setNewGasto({ ...newGasto, porDia: e.target.checked })}
            className="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
          />
          Este gasto se repite por cada día del viaje
        </label>
      </form>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {gastos.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">No hay gastos para este viaje</p>
        ) : (
          gastos.map((gasto) => (
            <FilaGastoViaje
              key={gasto.id}
              item={gasto}
              dias={dias}
              onUpdate={updateGasto}
              onRemove={removeGasto}
              formatCurrency={formatCurrency}
            />
          ))
        )}
      </div>
    </div>
  );
}
