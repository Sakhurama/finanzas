import React, { useState } from 'react';
import { Plane, CalendarCheck, PiggyBank, Plus } from 'lucide-react';
import { calcularFechaViaje, progresoPct, formatFecha, nombrePeriodo } from '../utils/viajes';

// Tarjeta de resumen del viaje activo: total, meta de ahorro, fecha más próxima
// para reunir el dinero y barra de progreso del ahorro.
// Se monta con key={viaje.id} en el padre para reiniciar el estado al cambiar de viaje.
export default function TarjetaResumenViaje({ viaje, total, onGuardarMeta, onRegistrarAhorro, formatCurrency }) {
  const [metaDisplay, setMetaDisplay] = useState(
    viaje.ahorro_monto ? new Intl.NumberFormat('es-CO').format(viaje.ahorro_monto) : ''
  );
  const [metaMonto, setMetaMonto] = useState(String(viaje.ahorro_monto || ''));
  const [frecuencia, setFrecuencia] = useState(viaje.ahorro_frecuencia);

  const [abonoMonto, setAbonoMonto] = useState('');
  const [abonoDisplay, setAbonoDisplay] = useState('');

  const handleMiles = (value, setMonto, setDisplay) => {
    const numericString = value.replace(/\D/g, '');
    if (numericString === '') {
      setMonto('');
      setDisplay('');
      return;
    }
    setMonto(numericString);
    setDisplay(new Intl.NumberFormat('es-CO').format(parseInt(numericString, 10)));
  };

  const { fecha, periodos, falta, completado } = calcularFechaViaje({
    total,
    ahorrado: viaje.ahorrado,
    ahorroMonto: viaje.ahorro_monto,
    frecuencia: viaje.ahorro_frecuencia,
  });
  const pct = progresoPct(viaje.ahorrado, total);

  const guardarMeta = (e) => {
    e.preventDefault();
    if (!metaMonto) return;
    onGuardarMeta(Number(metaMonto), frecuencia);
  };

  const registrarAbono = (e) => {
    e.preventDefault();
    if (!abonoMonto) return;
    onRegistrarAhorro(Number(abonoMonto));
    setAbonoMonto('');
    setAbonoDisplay('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Banner destacado con la fecha más próxima */}
      <div className="bg-sky-600 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
          <Plane className="w-32 h-32" />
        </div>
        <h3 className="flex items-center gap-2 font-medium text-sky-100 mb-1 z-10 relative">
          <Plane className="w-5 h-5" />
          {viaje.concepto} · {viaje.duracion_dias} días
        </h3>
        <p className="text-sm text-sky-200 z-10 relative mb-3">Costo total estimado: {formatCurrency(total)}</p>

        <div className="flex items-center gap-2 z-10 relative">
          <CalendarCheck className="w-6 h-6" />
          <div>
            <p className="text-xs text-sky-200">Fecha más próxima para viajar</p>
            <p className="text-2xl font-bold">
              {completado
                ? '¡Ya reuniste el dinero!'
                : fecha
                  ? formatFecha(fecha)
                  : 'Define tu meta de ahorro'}
            </p>
            {!completado && fecha && (
              <p className="text-xs text-sky-200 mt-0.5">
                en {periodos} {nombrePeriodo(viaje.ahorro_frecuencia, periodos)} aprox.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Barra de progreso del ahorro */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-600">Ahorrado: {formatCurrency(viaje.ahorrado)}</span>
            <span className="text-slate-400">{pct}%</span>
          </div>
          <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
            <div className="bg-sky-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {completado ? 'Meta completada' : `Te faltan ${formatCurrency(falta)}`}
          </p>
        </div>

        {/* Meta de ahorro: cuota + frecuencia */}
        <form onSubmit={guardarMeta} className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <PiggyBank className="w-4 h-4 text-sky-500" />
            Mi meta de ahorro
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="$50.000"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={metaDisplay}
              onChange={(e) => handleMiles(e.target.value, setMetaMonto, setMetaDisplay)}
            />
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={frecuencia}
              onChange={(e) => setFrecuencia(e.target.value)}
            >
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              disabled={!metaMonto}
            >
              Guardar
            </button>
          </div>
        </form>

        {/* Registrar un abono al ahorro */}
        <form onSubmit={registrarAbono} className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Registrar ahorro</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="¿Cuánto ahorraste?"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={abonoDisplay}
              onChange={(e) => handleMiles(e.target.value, setAbonoMonto, setAbonoDisplay)}
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              disabled={!abonoMonto}
            >
              <Plus className="w-4 h-4" />
              Abonar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
