import React from 'react';
import { Sparkles, Loader2, MessageSquareText, AlertCircle } from 'lucide-react';

export default function TarjetaAsesorIA({ generateAdvice, isLoadingAdvice, incomesLength, advice, adviceError }) {
  return (
    <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-6 md:p-8 rounded-2xl shadow-lg text-white mt-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">
          <h3 className="text-2xl font-bold flex items-center gap-2 mb-2 text-indigo-50">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Asesor Financiero IA
          </h3>
          <p className="text-indigo-200 mb-6">
            Obtén un análisis personalizado de tu situación actual y consejos específicos para mejorar tu salud financiera, impulsado por Gemini.
          </p>
          
          <button 
            onClick={generateAdvice}
            disabled={isLoadingAdvice || incomesLength === 0}
            className="bg-amber-400 hover:bg-amber-500 text-indigo-950 font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingAdvice ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analizando finanzas...
              </>
            ) : (
              <>
                <MessageSquareText className="w-5 h-5" />
                ✨ Analizar mis finanzas
              </>
            )}
          </button>
          
          {incomesLength === 0 && (
            <p className="text-sm text-indigo-300 mt-2">Agrega al menos un ingreso para obtener tu análisis.</p>
          )}
        </div>

        {/* Resultado de la IA */}
        {(advice || adviceError || isLoadingAdvice) && (
          <div className="flex-1 bg-white/10 p-6 rounded-xl border border-white/20 w-full min-h-[150px]">
            {isLoadingAdvice ? (
              <div className="flex flex-col items-center justify-center h-full text-indigo-200 space-y-3 py-8">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                <p className="text-sm animate-pulse text-center">La IA de Gemini está evaluando tus ingresos y deudas...</p>
              </div>
            ) : adviceError ? (
              <div className="flex items-center gap-2 text-rose-300">
                <AlertCircle className="w-5 h-5" />
                <p>{adviceError}</p>
              </div>
            ) : (
              <div className="text-indigo-50 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {advice}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
