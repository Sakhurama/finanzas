import React from 'react';
import { Calendar, PiggyBank } from 'lucide-react';

export default function TarjetaPresupuesto({ weeklyBudget, suggestedSavings, formatCurrency }) {
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
            <p className="text-xs text-slate-500 mt-1">Para alimentos, transporte y ocio (4 semanas).</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(weeklyBudget)}</p>
            <p className="text-xs text-slate-400">por semana</p>
          </div>
        </div>

        <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <PiggyBank className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-indigo-900">Ahorro sugerido</p>
              <p className="text-xs text-indigo-700">20% de tu dinero libre mensual</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-700">{formatCurrency(suggestedSavings)}</p>
            <p className="text-xs text-indigo-500">al mes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
