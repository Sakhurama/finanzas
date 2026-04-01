import React from 'react';

export default function TarjetaEstadistica({ title, amount, icon: Icon, iconColorClass }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        <Icon className={`w-5 h-5 ${iconColorClass}`} />
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-slate-900">{amount}</p>
    </div>
  );
}
