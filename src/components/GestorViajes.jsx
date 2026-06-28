import React, { useState } from 'react';
import { Plus, Plane, Trash2, CalendarCheck } from 'lucide-react';
import { totalViaje, calcularFechaViaje, formatFecha } from '../utils/viajes';

// Gestor de viajes: formulario para crear un viaje nuevo y lista de viajes existentes.
// Al seleccionar un viaje se marca como activo para gestionar sus gastos y su ahorro.
export default function GestorViajes({
  viajes,
  gastos,
  viajeActivoId,
  onSelect,
  newViaje,
  setNewViaje,
  handleAddViaje,
  removeViaje,
  formatCurrency,
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newViaje.name.trim() || !newViaje.dias) return;
    setIsSaving(true);
    await handleAddViaje();
    setIsSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="flex items-center gap-2 text-lg font-bold text-sky-600 mb-4 border-b border-slate-100 pb-2">
        <Plane className="w-5 h-5" />
        Mis Viajes
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Ej. Viaje a la playa"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          value={newViaje.name}
          onChange={(e) => setNewViaje({ ...newViaje, name: e.target.value })}
        />
        <input
          type="number"
          min="1"
          placeholder="Días"
          className="w-full lg:w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          value={newViaje.dias}
          onChange={(e) => setNewViaje({ ...newViaje, dias: e.target.value })}
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full lg:w-auto bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
          disabled={!newViaje.name.trim() || !newViaje.dias || isSaving}
        >
          <Plus className="w-auto h-5" />
          <span className="font-bold lg:hidden">Crear viaje</span>
        </button>
      </form>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
        {viajes.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">No hay viajes planificados todavía</p>
        ) : (
          viajes.map((viaje) => {
            const gastosViaje = gastos.filter((g) => g.viaje_id === viaje.id);
            const total = totalViaje(gastosViaje, viaje.duracion_dias);
            const { fecha, completado } = calcularFechaViaje({
              total,
              ahorrado: viaje.ahorrado,
              ahorroMonto: viaje.ahorro_monto,
              frecuencia: viaje.ahorro_frecuencia,
            });
            const activo = viaje.id === viajeActivoId;

            return (
              <div
                key={viaje.id}
                onClick={() => onSelect(viaje.id)}
                className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-colors ${
                  activo
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700">{viaje.concepto}</span>
                  <span className="text-xs text-slate-400">
                    {viaje.duracion_dias} días · {formatCurrency(total)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-sky-600 mt-0.5">
                    <CalendarCheck className="w-3 h-3" />
                    {completado
                      ? '¡Meta alcanzada!'
                      : fecha
                        ? `Listo: ${formatFecha(fecha)}`
                        : 'Define una meta de ahorro'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeViaje(viaje.id);
                  }}
                  className="text-slate-300 hover:text-rose-500 transition-colors"
                  title="Eliminar viaje"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
