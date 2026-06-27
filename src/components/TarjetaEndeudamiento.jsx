import React from 'react';
import { PieChart, AlertCircle } from 'lucide-react';

export default function TarjetaEndeudamiento({ debtPercentage, healthStatus, umbral, onUmbralInput, onUmbralCommit }) {
  // Color de la barra relativo al umbral elegido por el usuario
  const barColor =
    debtPercentage > umbral + 7 ? 'bg-rose-500'
    : debtPercentage > umbral ? 'bg-amber-400'
    : 'bg-emerald-500';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            Nivel de Endeudamiento
          </h3>
          <p className="text-sm text-slate-500 mt-1">Qué % de tus ingresos se va en pagos de deudas (préstamos, tarjetas).</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${healthStatus.bg} ${healthStatus.color}`}>
          {healthStatus.text}
        </div>
      </div>

      <div className="flex items-end gap-4 mb-4">
        <span className={`text-5xl font-extrabold tracking-tight ${healthStatus.color}`}>
          {debtPercentage}%
        </span>
      </div>

      {/* Barra de progreso visual con marcador del umbral */}
      <div className="relative w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-in-out`}
          style={{ width: `${Math.min(debtPercentage, 100)}%` }}
        ></div>
        {/* Marcador del umbral saludable */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-700"
          style={{ left: `${Math.min(umbral, 100)}%` }}
          title={`Tu umbral: ${umbral}%`}
        ></div>
      </div>

      {/* Control para ajustar el umbral */}
      <div className="mt-5">
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="umbral" className="text-sm font-medium text-slate-700">Mi umbral saludable</label>
          <span className="text-sm font-bold text-indigo-600">{umbral}%</span>
        </div>
        <input
          id="umbral"
          type="range"
          min="5"
          max="60"
          step="1"
          value={umbral}
          onChange={(e) => onUmbralInput(Number(e.target.value))}
          onMouseUp={(e) => onUmbralCommit(Number(e.target.value))}
          onTouchEnd={(e) => onUmbralCommit(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer"
        />
      </div>

      <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        Estándar recomendado: 36% (regla deuda-ingreso). Ajusta el umbral a lo que consideres saludable.
      </p>
    </div>
  );
}
