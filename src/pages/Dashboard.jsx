import React, { useEffect, useState, useMemo } from 'react';
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react';
import { supabase } from '../supabaseClient';

import Navbar from '../components/Navbar';
import TarjetaEstadistica from '../components/TarjetaEstadistica';
import TarjetaDineroLibre from '../components/TarjetaDineroLibre';
import TarjetaEndeudamiento from '../components/TarjetaEndeudamiento';
import TarjetaPresupuesto from '../components/TarjetaPresupuesto';
import GestorIngresos from '../components/GestorIngresos';
import GestorDeudas from '../components/GestorDeudas';
import TarjetaAsesorIA from '../components/TarjetaAsesorIA';

export default function Dashboard() {

  // Estado para ingresos y deudas
  const [incomes, setIncomes] = useState([]);
  const [debts, setDebts] = useState([]);

  // Estado para los formularios
  const [newIncome, setNewIncome] = useState({ name: '', amount: '' });
  const [newDebt, setNewDebt] = useState({ name: '', amount: '' });

  // Estado para la IA de Gemini
  const [advice, setAdvice] = useState('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [adviceError, setAdviceError] = useState('');

  // Cálculos automáticos usando useMemo para optimización
  const totalIncome = useMemo(() => incomes.reduce((acc, curr) => acc + curr.monto, 0), [incomes]);
  const totalDebts = useMemo(() => debts.reduce((acc, curr) => acc + curr.monto, 0), [debts]);
  const freeMoney = totalIncome - totalDebts;

  // Porcentaje de endeudamiento (Deudas / Ingresos * 100)
  const debtPercentage = totalIncome > 0 ? ((totalDebts / totalIncome) * 100).toFixed(1) : 0;

  // Gasto semanal saludable: Dinero libre menos un 20% de ahorro sugerido, dividido en 4 semanas
  const weeklyBudget = freeMoney > 0 ? (freeMoney * 0.8) / 4 : 0;
  const suggestedSavings = freeMoney > 0 ? freeMoney * 0.2 : 0;

  // Función para guardar registros en Supabase
  const guardarRegistro = async (name, amount, type) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('finanzas_personales')
    .insert([
      { 
        user_id: user.id, 
        concepto: name, // Ejemplo: "Sueldo Logic"
        monto: amount,   // Ejemplo: 3300000
        tipo: type       // "ingreso" o "deuda"
      }
    ])
    .select()

  if (error) {
    console.error("Error al guardar:", error.message)
    return null;
  }
  
  return data[0];
}

  // Formateador de moneda (Estilo peso/dólar genérico)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Función para cargar datos desde Supabase
  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Consultamos todos los registros del usuario
    const { data, error } = await supabase
      .from('finanzas_personales')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error("Error al cargar datos:", error.message);
      return;
    }

    console.log("Tipo de dato de 'data':", typeof data);
    console.table(data);

    // Filtramos los datos para separar ingresos y deudas
    const ingresos = data.filter(r => r.tipo === 'ingreso');
    const deudas = data.filter(r => r.tipo === 'deuda');

    console.log("Ingresos:", ingresos);
    console.log("Deudas:", deudas);

    // Actualizamos los estados de React
    setIncomes(ingresos);
    setDebts(deudas);
  };

  // Usamos useEffect para que se ejecute solo al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Manejadores para agregar
  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!newIncome.name || !newIncome.amount) return;
    
    // Extraemos valores y limpiamos campos inmediatamente
    const name = newIncome.name;
    const amount = Number(newIncome.amount);
    setNewIncome({ name: '', amount: '' });


    // Guardamos y obtenemos el registro real con el ID de la base de datos
    const newRecord = await guardarRegistro(name, amount, 'ingreso');
    
    if (newRecord) {
      setIncomes(prev => [...prev, newRecord]);
    }
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.amount) return;
    
    // Extraemos valores y limpiamos campos inmediatamente
    const name = newDebt.name;
    const amount = Number(newDebt.amount);
    setNewDebt({ name: '', amount: '' });

    // Guardamos y obtenemos el registro real con el ID de la base de datos
    const newRecord = await guardarRegistro(name, amount, 'deuda');
    
    if (newRecord) {
      setDebts(prev => [...prev, newRecord]);
    }
  };

  // Manejadores para eliminar
  const removeIncome = async (id) => {
  // 1. Eliminamos el registro directamente en la base de datos de Supabase
  const { error } = await supabase
    .from('finanzas_personales')
    .delete()
    .eq('id', id); // Esto es como un WHERE en SQL: "Borra donde el id sea igual a este id"

  // 2. Manejamos cualquier posible error (ej. problemas de conexión)
  if (error) {
    console.error("Error al eliminar el ingreso:", error.message);
    // Aquí podrías mostrar un alert() o un toast para avisarle al usuario
    return; // Detenemos la ejecución para que no se borre de la pantalla si falló en la BD
  }

  // 3. Si no hubo errores en Supabase, actualizamos el estado de React (la UI)
  setIncomes(incomes.filter(inc => inc.id !== id));
};

  const removeDebt = async (id) => {
  // 1. Eliminamos el registro directamente en la base de datos de Supabase
  const { error } = await supabase
    .from('finanzas_personales')
    .delete()
    .eq('id', id); // Esto es como un WHERE en SQL: "Borra donde el id sea igual a este id"

  // 2. Manejamos cualquier posible error (ej. problemas de conexión)
  if (error) {
    console.error("Error al eliminar la deuda:", error.message);
    // Aquí podrías mostrar un alert() o un toast para avisarle al usuario
    return; // Detenemos la ejecución para que no se borre de la pantalla si falló en la BD
  }

  // 3. Si no hubo errores en Supabase, actualizamos el estado de React (la UI)
  setDebts(debts.filter(debt => debt.id !== id));
};

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

    const url = '/api/getAdvice';

    const systemInstruction = "Eres un asesor financiero empático y experto. Analiza el resumen financiero que te da el usuario. Dale una breve evaluación de su estado actual y dale 3 consejos muy específicos y accionables para mejorar o mantener su salud financiera, basados en los nombres de los ítems de ingresos y deudas. Responde en español, usando un tono amigable. Formatea el texto con viñetas claras.";
    const userPrompt = `Aquí están mis finanzas mensuales:\nIngresos Totales: ${formatCurrency(totalIncome)} (Detalles: ${incomes.map(i => i.concepto).join(', ')})\nDeudas Totales: ${formatCurrency(totalDebts)} (Detalles: ${debts.map(d => d.concepto).join(', ')})\nDinero Libre: ${formatCurrency(freeMoney)}\nPorcentaje de Endeudamiento: ${debtPercentage}%. \n¿Qué me aconsejas?`;

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
      console.log("Respuesta cruda de Gemini:", data); 

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        setAdvice(text);
      } else if (data.promptFeedback?.blockReason) {
        throw new Error(`Google bloqueó la respuesta por: ${data.promptFeedback.blockReason}`);
      } else {
        throw new Error("La API no devolvió candidatos válidos.");
      }
    } catch (error) {
      console.error("Detalle completo del error:", error);
      
      setAdviceError(`Hubo un problema: ${error.message || 'Intenta de nuevo más tarde.'}`);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Encabezado */}
        <header className="mb-8">
          <Navbar />
          <p className="text-slate-500 mt-10">Gestiona tus ingresos, controla tus deudas fijas y planifica tu semana.</p>
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
            guardarRegistro={guardarRegistro}
          />

          <GestorDeudas
            debts={debts}
            newDebt={newDebt}
            setNewDebt={setNewDebt}
            handleAddDebt={handleAddDebt}
            removeDebt={removeDebt}
            formatCurrency={formatCurrency}
            guardarRegistro={guardarRegistro}
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