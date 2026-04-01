import React from 'react';
import { Wallet } from 'lucide-react';

export default function TarjetaDineroLibre({ freeMoney }) {
  return (
    <div className="bg-indigo-600 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center lg:col-span-2 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
        <Wallet className="w-32 h-32" />
      </div>
      <h3 className="font-medium text-indigo-100 mb-1 z-10">Dinero Libre (Después de deudas)</h3>
      <p className="text-4xl font-bold mb-2 z-10">{freeMoney}</p>
      <p className="text-sm text-indigo-200 z-10">Este es el dinero disponible para gastos variables y ahorro.</p>
    </div>
  );
}
