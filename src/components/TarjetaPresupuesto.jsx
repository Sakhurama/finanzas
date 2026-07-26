import React from 'react';
import { Calendar, PiggyBank } from 'lucide-react';

export default function TarjetaPresupuesto({ weeklyBudget, suggestedSavings, ahorroActivo, onToggleAhorro, formatCurrency }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-indigo-500" />
        Presupuesto Recomendado
      </h3>

      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <p className="font-medium text-slate-700">Gasto semanal saludable</p>
            <p className="text-xs text-slate-500 mt-1">
              {ahorroActivo
                ? 'Para alimentos, transporte y ocio (4 semanas).'
                : 'Incluye el dinero del ahorro (4 semanas).'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(weeklyBudget)}</p>
            <p className="text-xs text-slate-400">por semana</p>
          </div>
        </div>

        {/* Ahorro sugerido: se puede desactivar cuando no hay margen para ahorrar */}
        <div
          className={`p-4 rounded-xl border transition-colors ${
            ahorroActivo ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${ahorroActivo ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                <PiggyBank className={`w-5 h-5 ${ahorroActivo ? 'text-indigo-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className={`font-medium ${ahorroActivo ? 'text-indigo-900' : 'text-slate-500'}`}>Ahorro sugerido</p>
                <p className={`text-xs ${ahorroActivo ? 'text-indigo-700' : 'text-slate-400'}`}>
                  {ahorroActivo ? '20% de tu dinero libre mensual' : 'Desactivado: todo va al gasto semanal'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${ahorroActivo ? 'text-indigo-700' : 'text-slate-400'}`}>
                {formatCurrency(suggestedSavings)}
              </p>
              <p className={`text-xs ${ahorroActivo ? 'text-indigo-500' : 'text-slate-400'}`}>al mes</p>
            </div>
          </div>

          {/* Interruptor para activar/desactivar el ahorro */}
          <label className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200/70 cursor-pointer">
            <span className={`text-sm font-medium ${ahorroActivo ? 'text-indigo-900' : 'text-slate-600'}`}>
              Apartar ahorro este mes
            </span>
            <span className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={ahorroActivo}
                onChange={(e) => onToggleAhorro(e.target.checked)}
                className="sr-only peer"
              />
              <span className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-indigo-600 transition-colors"></span>
              <span className="absolute left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
