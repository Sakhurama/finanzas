import React, { useState } from 'react';
import { FileDown, Copy, Check, Download } from 'lucide-react';

// Tarjeta para exportar el panorama financiero como Markdown (copiar o descargar).
export default function TarjetaExportar({ onCopiar, onDescargar }) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    const ok = await onCopiar();
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-600 mb-1 border-b border-slate-100 pb-2">
        <FileDown className="w-5 h-5" />
        Exportar resumen
      </h3>
      <p className="text-sm text-slate-500 mt-2 mb-4">
        Copia o descarga tus finanzas en formato Markdown para analizarlas con una IA externa.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleCopiar}
          className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiado ? '¡Copiado!' : 'Copiar al portapapeles'}
        </button>
        <button
          type="button"
          onClick={onDescargar}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Descargar .md
        </button>
      </div>
    </div>
  );
}
