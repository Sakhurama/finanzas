import React, { useState, useMemo } from 'react';
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react';

import TarjetaEstadistica from './components/TarjetaEstadistica';
import TarjetaDineroLibre from './components/TarjetaDineroLibre';
import TarjetaEndeudamiento from './components/TarjetaEndeudamiento';
import TarjetaPresupuesto from './components/TarjetaPresupuesto';
import GestorIngresos from './components/GestorIngresos';
import GestorDeudas from './components/GestorDeudas';
import TarjetaAsesorIA from './components/TarjetaAsesorIA';

export default function App() {
  // Estado para ingresos y deudas
  const [incomes, setIncomes] = useState([
    { id: 1, name: 'Salario principal', amount: 3000000 },
  ]);
  const [debts, setDebts] = useState([
    { id: 1, name: 'Arriendo / Hipoteca', amount: 900000 },
    { id: 2, name: 'Servicios públicos', amount: 250000 },
  ]);

  // Estado para los formularios
  const [newIncome, setNewIncome] = useState({ name: '', amount: '' });
  const [newDebt, setNewDebt] = useState({ name: '', amount: '' });

  // Estado para la IA de Gemini
  const [advice, setAdvice] = useState('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [adviceError, setAdviceError] = useState('');

  // Cálculos automáticos usando useMemo para optimización
  const totalIncome = useMemo(() => incomes.reduce((acc, curr) => acc + curr.amount, 0), [incomes]);
  const totalDebts = useMemo(() => debts.reduce((acc, curr) => acc + curr.amount, 0), [debts]);
  const freeMoney = totalIncome - totalDebts;
  
  // Porcentaje de endeudamiento (Deudas / Ingresos * 100)
  const debtPercentage = totalIncome > 0 ? ((totalDebts / totalIncome) * 100).toFixed(1) : 0;
  
  // Gasto semanal saludable: Dinero libre menos un 20% de ahorro sugerido, dividido en 4 semanas
  const weeklyBudget = freeMoney > 0 ? (freeMoney * 0.8) / 4 : 0;
  const suggestedSavings = freeMoney > 0 ? freeMoney * 0.2 : 0;

  // Formateador de moneda (Estilo peso/dólar genérico)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Manejadores para agregar/eliminar items
  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!newIncome.name || !newIncome.amount) return;
    setIncomes([...incomes, { id: Date.now(), name: newIncome.name, amount: Number(newIncome.amount) }]);
    setNewIncome({ name: '', amount: '' });
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.amount) return;
    setDebts([...debts, { id: Date.now(), name: newDebt.name, amount: Number(newDebt.amount) }]);
    setNewDebt({ name: '', amount: '' });
  };

  const removeIncome = (id) => setIncomes(incomes.filter(inc => inc.id !== id));
  const removeDebt = (id) => setDebts(debts.filter(debt => debt.id !== id));

  // Determinar color y mensaje de salud financiera
  const getFinancialHealth = () => {
    if (totalIncome === 0) return { color: 'text-gray-500', bg: 'bg-gray-100', text: 'Ingresa tus datos' };
    if (debtPercentage < 30) return { color: 'text-emerald-600', bg: 'bg-emerald-100', text: 'Excelente (Menos del 30%)' };
    if (debtPercentage <= 40) return { color: 'text-amber-500', bg: 'bg-amber-100', text: 'Precaución (30% - 40%)' };
    return { color: 'text-rose-500', bg: 'bg-rose-100', text: 'Peligro (Más del 40%)' };
  };

  const healthStatus = getFinancialHealth();

  // Función para llamar a Gemini API
  const generateAdvice = async () => {
    setIsLoadingAdvice(true);
    setAdviceError('');
    
    const apiKey = ""; // Proporcionada por el entorno de ejecución
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const systemInstruction = "Eres un asesor financiero empático y experto. Analiza el resumen financiero que te da el usuario. Dale una breve evaluación de su estado actual y dale 3 consejos muy específicos y accionables para mejorar o mantener su salud financiera, basados en los nombres de los ítems de ingresos y deudas. Responde en español, usando un tono amigable. Formatea el texto con viñetas claras.";
    const userPrompt = `Aquí están mis finanzas mensuales:\nIngresos Totales: ${formatCurrency(totalIncome)} (Detalles: ${incomes.map(i=>i.name).join(', ')})\nDeudas Totales: ${formatCurrency(totalDebts)} (Detalles: ${debts.map(d=>d.name).join(', ')})\nDinero Libre: ${formatCurrency(freeMoney)}\nPorcentaje de Endeudamiento: ${debtPercentage}%. \n¿Qué me aconsejas?`;

    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    const fetchWithRetry = async (retries = 5, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return await response.json();
        } catch (e) {
          if (i === retries - 1) throw e;
          await new Promise(res => setTimeout(res, delay * Math.pow(2, i))); // Exponential backoff (1s, 2s, 4s, 8s, 16s)
        }
      }
    };

    try {
      const data = await fetchWithRetry();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setAdvice(text);
      } else {
        throw new Error("Respuesta vacía de la API");
      }
    } catch (error) {
      console.error("Error al obtener consejo de la IA:", error);
      setAdviceError("Lo siento, no pude conectar con el asesor IA en este momento. Intenta de nuevo más tarde.");
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Encabezado */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-indigo-600" />
            Mi Control Financiero
          </h1>
          <p className="text-slate-500 mt-2">Gestiona tus ingresos, controla tus deudas fijas y planifica tu semana.</p>
        </header>

        {/* Panel de Resumen Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TarjetaEstadistica 
            title="Ingresos Totales" 
            amount={formatCurrency(totalIncome)} 
            icon={TrendingUp} 
            iconColorClass="text-emerald-500" 
          />
          
          <TarjetaEstadistica 
            title="Deudas Fijas Totales" 
            amount={formatCurrency(totalDebts)} 
            icon={TrendingDown} 
            iconColorClass="text-rose-500" 
          />

          <TarjetaDineroLibre freeMoney={formatCurrency(freeMoney)} />
        </div>

        {/* Panel de Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TarjetaEndeudamiento 
            debtPercentage={debtPercentage} 
            healthStatus={healthStatus} 
          />

          <TarjetaPresupuesto 
            weeklyBudget={weeklyBudget} 
            suggestedSavings={suggestedSavings} 
            formatCurrency={formatCurrency} 
          />
        </div>

        {/* Formularios e Inventario */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GestorIngresos 
            incomes={incomes}
            newIncome={newIncome}
            setNewIncome={setNewIncome}
            handleAddIncome={handleAddIncome}
            removeIncome={removeIncome}
            formatCurrency={formatCurrency}
          />

          <GestorDeudas 
            debts={debts}
            newDebt={newDebt}
            setNewDebt={setNewDebt}
            handleAddDebt={handleAddDebt}
            removeDebt={removeDebt}
            formatCurrency={formatCurrency}
          />
        </div>

        <TarjetaAsesorIA 
          generateAdvice={generateAdvice}
          isLoadingAdvice={isLoadingAdvice}
          incomesLength={incomes.length}
          advice={advice}
          adviceError={adviceError}
        />

      </div>
    </div>
  );
}