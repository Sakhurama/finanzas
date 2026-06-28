import React, { useState } from 'react';
import { Trash2, Pencil, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';

// Estilos de color por tipo de gestor (se reutiliza el mismo acento que la cabecera de cada tarjeta)
const COLORS = {
  emerald: { text: 'text-emerald-600', ring: 'focus:ring-emerald-500' },
  rose: { text: 'text-rose-600', ring: 'focus:ring-rose-500' },
  violet: { text: 'text-violet-600', ring: 'focus:ring-violet-500' },
  amber: { text: 'text-amber-600', ring: 'focus:ring-amber-500' },
};

// Formatea un número a string con separadores de miles (es-CO)
const formatMiles = (valor) => new Intl.NumberFormat('es-CO').format(valor);

// Fila de un registro financiero: muestra concepto + monto, y permite editarlo o eliminarlo en línea.
// Si se pasa `onToggle`, además permite activar/desactivar el registro (excluyéndolo de los totales).
export default function FilaRegistro({ item, color = 'emerald', onUpdate, onRemove, formatCurrency, onToggle }) {
  const c = COLORS[color] || COLORS.emerald;
  const activo = item.activo !== false;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.concepto);
  const [editAmount, setEditAmount] = useState(String(item.monto));
  const [editDisplay, setEditDisplay] = useState(formatMiles(item.monto));
  const [isSaving, setIsSaving] = useState(false);

  // Entramos a modo edición sincronizando los campos con los valores actuales del registro
  const startEdit = () => {
    setEditName(item.concepto);
    setEditAmount(String(item.monto));
    setEditDisplay(formatMiles(item.monto));
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  // Igual que en los formularios de alta: solo dígitos y formateo de miles en vivo
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
    await onUpdate(item.id, editName.trim(), Number(editAmount));
    setIsSaving(false);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className={`flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${c.ring}`}
        />
        <input
          type="text"
          inputMode="numeric"
          value={editDisplay}
          onChange={handleAmountChange}
          className={`w-full sm:w-1/3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${c.ring}`}
        />
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={saveEdit}
            disabled={!editName.trim() || !editAmount || isSaving}
            className="text-emerald-500 hover:text-emerald-600 disabled:text-slate-300 transition-colors"
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
    );
  }

  return (
    <div className={`flex justify-between items-center p-3 rounded-xl border border-transparent transition-colors ${activo ? 'hover:bg-slate-50 hover:border-slate-100' : 'opacity-50'}`}>
      <span className={`font-medium ${activo ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{item.concepto}</span>
      <div className="flex items-center gap-4">
        <span className={`font-semibold ${activo ? c.text : 'text-slate-400 line-through'}`}>{formatCurrency(item.monto)}</span>
        {onToggle && (
          <button
            type="button"
            onClick={() => onToggle(item.id, !activo)}
            className={`transition-colors ${activo ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-slate-400'}`}
            title={activo ? 'Desactivar (ya pagado este mes)' : 'Activar'}
          >
            {activo ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
        )}
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
