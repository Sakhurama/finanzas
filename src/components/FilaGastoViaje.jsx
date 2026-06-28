import React, { useState } from 'react';
import { Trash2, Pencil, Check, X, CalendarDays } from 'lucide-react';
import { subtotalGasto } from '../utils/viajes';

// Formatea un número a string con separadores de miles (es-CO)
const formatMiles = (valor) => new Intl.NumberFormat('es-CO').format(valor);

// Fila de un gasto de viaje: muestra concepto + subtotal (monto × días si es "por día"),
// y permite editar concepto, monto y el toggle "por día", o eliminarlo en línea.
export default function FilaGastoViaje({ item, dias, onUpdate, onRemove, formatCurrency }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.concepto);
  const [editAmount, setEditAmount] = useState(String(item.monto));
  const [editDisplay, setEditDisplay] = useState(formatMiles(item.monto));
  const [editPorDia, setEditPorDia] = useState(item.por_dia);
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = () => {
    setEditName(item.concepto);
    setEditAmount(String(item.monto));
    setEditDisplay(formatMiles(item.monto));
    setEditPorDia(item.por_dia);
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  // Solo dígitos y formateo de miles en vivo
  const handleAmountChange = (e) => {
    const numericString = e.target.value.replace(/\D/g, '');
    if (numericString === '') {
      setEditAmount('');
      setEditDisplay('');
      return;
    }
    setEditAmount(numericString);
    setEditDisplay(formatMiles(parseInt(numericString, 10)));
  };

  const saveEdit = async () => {
    if (!editName.trim() || !editAmount) return;
    setIsSaving(true);
    await onUpdate(item.id, editName.trim(), Number(editAmount), editPorDia);
    setIsSaving(false);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <input
            type="text"
            inputMode="numeric"
            value={editDisplay}
            onChange={handleAmountChange}
            className="w-full sm:w-1/3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={saveEdit}
              disabled={!editName.trim() || !editAmount || isSaving}
              className="text-sky-500 hover:text-sky-600 disabled:text-slate-300 transition-colors"
              title="Guardar"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="Cancelar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={editPorDia}
            onChange={(e) => setEditPorDia(e.target.checked)}
            className="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
          />
          Este gasto se repite por cada día del viaje
        </label>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
      <div className="flex flex-col">
        <span className="font-medium text-slate-700">{item.concepto}</span>
        {item.por_dia && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <CalendarDays className="w-3 h-3" />
            {formatCurrency(item.monto)} × {dias} días
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sky-600 font-semibold">{formatCurrency(subtotalGasto(item, dias))}</span>
        <button
          type="button"
          onClick={startEdit}
          className="text-slate-300 hover:text-indigo-500 transition-colors"
          title="Editar"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="text-slate-300 hover:text-rose-500 transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
