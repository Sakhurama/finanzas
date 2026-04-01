import React from 'react';
import { PieChart, AlertCircle } from 'lucide-react';

export default function TarjetaEndeudamiento({ debtPercentage, healthStatus }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            Nivel de Endeudamiento
          </h3>
          <p className="text-sm text-slate-500 mt-1">Qué porcentaje de tus ingresos se va en deudas.</p>
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

      {/* Barra de progreso visual */}
      <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
        <div 
          className={`h-full ${debtPercentage > 40 ? 'bg-rose-500' : debtPercentage > 30 ? 'bg-amber-400' : 'bg-emerald-500'} transition-all duration-500 ease-in-out`}
          style={{ width: `${Math.min(debtPercentage, 100)}%` }}
        ></div>
      </div>
      
      <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        Los expertos recomiendan mantener tus deudas por debajo del 30% de tus ingresos.
      </p>
    </div>
  );
}
