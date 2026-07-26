import React, { useEffect, useState, useMemo } from 'react';
import { Wallet, TrendingDown, TrendingUp, ShoppingBag, CreditCard } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { formatCurrency } from '../utils/format';
import { generarResumenMarkdown } from '../utils/exportarMarkdown';

import Navbar from '../components/Navbar';
import TarjetaEstadistica from '../components/TarjetaEstadistica';
import TarjetaDineroLibre from '../components/TarjetaDineroLibre';
import TarjetaEndeudamiento from '../components/TarjetaEndeudamiento';
import TarjetaPresupuesto from '../components/TarjetaPresupuesto';
import GestorIngresos from '../components/GestorIngresos';
import GestorDeudas from '../components/GestorDeudas';
import GestorGastosVariables from '../components/GestorGastosVariables';
import GestorDeudasReales from '../components/GestorDeudasReales';
import TarjetaAsesorIA from '../components/TarjetaAsesorIA';
import TarjetaExportar from '../components/TarjetaExportar';

export default function Dashboard() {

  // Estado para ingresos, gastos fijos, gastos variables y deudas reales
  const [incomes, setIncomes] = useState([]);
  const [debts, setDebts] = useState([]);
  const [variableExpenses, setVariableExpenses] = useState([]);
  const [realDebts, setRealDebts] = useState([]);

  // Nombre del usuario logueado (proviene de la sesión de Supabase / Google OAuth)
  const [userName, setUserName] = useState('Usuario');

  // Estado para los formularios
  const [newIncome, setNewIncome] = useState({ name: '', amount: '' });
  const [newDebt, setNewDebt] = useState({ name: '', amount: '' });
  const [newVariableExpense, setNewVariableExpense] = useState({ name: '', amount: '' });
  const [newRealDebt, setNewRealDebt] = useState({ name: '', amount: '' });

  // Umbral de endeudamiento saludable (ajustable por el usuario). Default sugerido: 36% (estándar deuda-ingreso/DTI)
  const [umbral, setUmbral] = useState(36);

  // El ahorro sugerido se puede desactivar (no siempre alcanza para ahorrar).
  // Al desactivarlo, ese 20% vuelve al gasto semanal.
  const [ahorroActivo, setAhorroActivo] = useState(true);

  // Estado para la IA de Gemini
  const [advice, setAdvice] = useState('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [adviceError, setAdviceError] = useState('');

  // Cálculos automáticos usando useMemo para optimización
  // Los ingresos desactivados no cuentan en los totales
  const totalIncome = useMemo(() => incomes.filter(i => i.activo !== false).reduce((acc, curr) => acc + curr.monto, 0), [incomes]);
  // Los gastos fijos y deudas desactivados (ya pagados este mes) no cuentan en los totales
  const totalDebts = useMemo(() => debts.filter(d => d.activo !== false).reduce((acc, curr) => acc + curr.monto, 0), [debts]);
  const totalVariableExpenses = useMemo(() => variableExpenses.reduce((acc, curr) => acc + curr.monto, 0), [variableExpenses]);
  const totalRealDebts = useMemo(() => realDebts.filter(d => d.activo !== false).reduce((acc, curr) => acc + curr.monto, 0), [realDebts]);
  const freeMoney = totalIncome - totalDebts - totalVariableExpenses - totalRealDebts;

  // Porcentaje de endeudamiento (Deudas reales / Ingresos * 100). Solo cuentan las deudas reales (préstamos, tarjetas), no los gastos fijos.
  const debtPercentage = totalIncome > 0 ? ((totalRealDebts / totalIncome) * 100).toFixed(1) : 0;

  // Ahorro sugerido: 20% del dinero libre. Si el usuario lo desactiva, no se aparta nada.
  const suggestedSavings = ahorroActivo && freeMoney > 0 ? freeMoney * 0.2 : 0;
  // Gasto semanal saludable: el dinero libre que queda tras el ahorro, dividido en 4 semanas.
  // Con el ahorro desactivado, el 100% del dinero libre se reparte en la semana.
  const weeklyBudget = freeMoney > 0 ? (freeMoney - suggestedSavings) / 4 : 0;

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

  // Función para actualizar un registro existente en Supabase (edición en línea)
  const actualizarRegistro = async (id, name, amount) => {
    const { data, error } = await supabase
      .from('finanzas_personales')
      .update({ concepto: name, monto: amount })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error al actualizar:", error.message);
      return null;
    }

    return data[0];
  };

  // Manejadores para editar (reemplazan el registro en su estado correspondiente)
  const updateIncome = async (id, name, amount) => {
    const updated = await actualizarRegistro(id, name, amount);
    if (updated) setIncomes(prev => prev.map(inc => inc.id === id ? updated : inc));
    else alert("No se pudo actualizar el ingreso. Intenta de nuevo.");
  };

  const updateDebt = async (id, name, amount) => {
    const updated = await actualizarRegistro(id, name, amount);
    if (updated) setDebts(prev => prev.map(debt => debt.id === id ? updated : debt));
    else alert("No se pudo actualizar el gasto fijo. Intenta de nuevo.");
  };

  const updateVariableExpense = async (id, name, amount) => {
    const updated = await actualizarRegistro(id, name, amount);
    if (updated) setVariableExpenses(prev => prev.map(exp => exp.id === id ? updated : exp));
    else alert("No se pudo actualizar el gasto variable. Intenta de nuevo.");
  };

  const updateRealDebt = async (id, name, amount) => {
    const updated = await actualizarRegistro(id, name, amount);
    if (updated) setRealDebts(prev => prev.map(debt => debt.id === id ? updated : debt));
    else alert("No se pudo actualizar la deuda. Intenta de nuevo.");
  };

  // Activa/desactiva un registro (gasto fijo o deuda). Lo inactivo no cuenta en los totales.
  const cambiarActivo = async (id, activo) => {
    const { data, error } = await supabase
      .from('finanzas_personales')
      .update({ activo })
      .eq('id', id)
      .select();

    if (error || !data) {
      console.error("Error al cambiar el estado:", error?.message);
      return null;
    }
    return data[0];
  };

  const toggleIncome = async (id, activo) => {
    const updated = await cambiarActivo(id, activo);
    if (updated) setIncomes(prev => prev.map(inc => inc.id === id ? updated : inc));
    else alert("No se pudo cambiar el estado del ingreso. Intenta de nuevo.");
  };

  const toggleDebt = async (id, activo) => {
    const updated = await cambiarActivo(id, activo);
    if (updated) setDebts(prev => prev.map(debt => debt.id === id ? updated : debt));
    else alert("No se pudo cambiar el estado del gasto fijo. Intenta de nuevo.");
  };

  const toggleRealDebt = async (id, activo) => {
    const updated = await cambiarActivo(id, activo);
    if (updated) setRealDebts(prev => prev.map(debt => debt.id === id ? updated : debt));
    else alert("No se pudo cambiar el estado de la deuda. Intenta de nuevo.");
  };

  // Activa/desactiva todos los registros de una categoría a la vez
  const cambiarActivoTodos = async (tipo, activo) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('finanzas_personales')
      .update({ activo })
      .eq('user_id', user.id)
      .eq('tipo', tipo);

    if (error) {
      console.error("Error al cambiar el estado de la categoría:", error.message);
      return false;
    }
    return true;
  };

  const toggleAllDebts = async (activo) => {
    const ok = await cambiarActivoTodos('deuda', activo);
    if (ok) setDebts(prev => prev.map(debt => ({ ...debt, activo })));
    else alert("No se pudo cambiar el estado de los gastos fijos. Intenta de nuevo.");
  };

  const toggleAllRealDebts = async (activo) => {
    const ok = await cambiarActivoTodos('deuda_real', activo);
    if (ok) setRealDebts(prev => prev.map(debt => ({ ...debt, activo })));
    else alert("No se pudo cambiar el estado de las deudas. Intenta de nuevo.");
  };

  // Función para cargar datos desde Supabase
  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Guardamos el nombre del usuario para mostrarlo en la barra de navegación
    const nombre =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      'Usuario';
    setUserName(nombre);

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

    // Filtramos los datos para separar ingresos, gastos fijos, gastos variables y deudas reales
    const ingresos = data.filter(r => r.tipo === 'ingreso');
    const deudas = data.filter(r => r.tipo === 'deuda');
    const gastosVariables = data.filter(r => r.tipo === 'gasto_variable');
    const deudasReales = data.filter(r => r.tipo === 'deuda_real');

    // Actualizamos los estados de React
    setIncomes(ingresos);
    setDebts(deudas);
    setVariableExpenses(gastosVariables);
    setRealDebts(deudasReales);

    // Cargamos las preferencias del usuario (umbral y ahorro sugerido), si la tabla existe
    try {
      const { data: pref } = await supabase
        .from('preferencias_usuario')
        .select('umbral_endeudamiento, ahorro_activo')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pref && pref.umbral_endeudamiento != null) {
        setUmbral(pref.umbral_endeudamiento);
      }
      if (pref && pref.ahorro_activo != null) {
        setAhorroActivo(pref.ahorro_activo);
      }
    } catch (e) {
      console.warn("No se pudieron cargar las preferencias:", e.message);
    }
  };

  // Guarda el umbral de endeudamiento elegido por el usuario en Supabase
  const guardarUmbral = async (valor) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('preferencias_usuario')
      .upsert({ user_id: user.id, umbral_endeudamiento: valor }, { onConflict: 'user_id' });

    if (error) console.error("Error al guardar el umbral:", error.message);
  };

  // Activa/desactiva el ahorro sugerido. Actualiza la UI de inmediato y persiste la preferencia.
  const toggleAhorro = async (valor) => {
    const anterior = ahorroActivo;
    setAhorroActivo(valor);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('preferencias_usuario')
      .upsert({ user_id: user.id, ahorro_activo: valor }, { onConflict: 'user_id' });

    if (error) {
      console.error("Error al guardar la preferencia de ahorro:", error.message);
      setAhorroActivo(anterior); // Revertimos si no se pudo guardar
      alert("No se pudo guardar la preferencia de ahorro. Intenta de nuevo.");
    }
  };

  // setUmbral actualiza la UI al mover el slider; guardarUmbral persiste al soltar (evita escrituras excesivas)

  // Usamos useEffect para que se ejecute solo al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Manejadores para agregar
  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!newIncome.name || !newIncome.amount) return;
    
    const name = newIncome.name;
    const amount = Number(newIncome.amount);
    
    // Generar ID temporal
    const tempId = `temp-${Date.now()}`;
    const tempRecord = { id: tempId, concepto: name, monto: amount, tipo: 'ingreso', activo: true };

    // Actualización optimista de la UI
    setIncomes(prev => [...prev, tempRecord]);
    setNewIncome({ name: '', amount: '' });

    // Guardamos y obtenemos el registro real con el ID de la base de datos
    const newRecord = await guardarRegistro(name, amount, 'ingreso');
    
    if (newRecord) {
      // Reemplazamos el registro temporal con el real
      setIncomes(prev => prev.map(inc => inc.id === tempId ? newRecord : inc));
    } else {
      // Revertimos el estado en caso de error
      setIncomes(prev => prev.filter(inc => inc.id !== tempId));
      alert("Hubo un error al guardar el ingreso. Por favor, intenta de nuevo.");
    }
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.amount) return;
    
    const name = newDebt.name;
    const amount = Number(newDebt.amount);
    
    // Generar ID temporal
    const tempId = `temp-${Date.now()}`;
    const tempRecord = { id: tempId, concepto: name, monto: amount, tipo: 'deuda', activo: true };

    // Actualización optimista de la UI
    setDebts(prev => [...prev, tempRecord]);
    setNewDebt({ name: '', amount: '' });

    // Guardamos y obtenemos el registro real con el ID de la base de datos
    const newRecord = await guardarRegistro(name, amount, 'deuda');
    
    if (newRecord) {
      // Reemplazamos el registro temporal con el real
      setDebts(prev => prev.map(debt => debt.id === tempId ? newRecord : debt));
    } else {
      // Revertimos el estado en caso de error
      setDebts(prev => prev.filter(debt => debt.id !== tempId));
      alert("Hubo un error al guardar la deuda. Por favor, intenta de nuevo.");
    }
  };

  const handleAddVariableExpense = async (e) => {
    e.preventDefault();
    if (!newVariableExpense.name || !newVariableExpense.amount) return;

    // Extraemos valores y limpiamos campos inmediatamente
    const name = newVariableExpense.name;
    const amount = Number(newVariableExpense.amount);
    setNewVariableExpense({ name: '', amount: '' });

    // Guardamos y obtenemos el registro real con el ID de la base de datos
    const newRecord = await guardarRegistro(name, amount, 'gasto_variable');

    if (newRecord) {
      setVariableExpenses(prev => [...prev, newRecord]);
    }
  };

  const handleAddRealDebt = async (e) => {
    e.preventDefault();
    if (!newRealDebt.name || !newRealDebt.amount) return;

    // Extraemos valores y limpiamos campos inmediatamente
    const name = newRealDebt.name;
    const amount = Number(newRealDebt.amount);
    setNewRealDebt({ name: '', amount: '' });

    // Guardamos y obtenemos el registro real con el ID de la base de datos
    const newRecord = await guardarRegistro(name, amount, 'deuda_real');

    if (newRecord) {
      setRealDebts(prev => [...prev, newRecord]);
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

  const removeVariableExpense = async (id) => {
  // 1. Eliminamos el registro directamente en la base de datos de Supabase
  const { error } = await supabase
    .from('finanzas_personales')
    .delete()
    .eq('id', id);

  // 2. Manejamos cualquier posible error (ej. problemas de conexión)
  if (error) {
    console.error("Error al eliminar el gasto variable:", error.message);
    return;
  }

  // 3. Si no hubo errores en Supabase, actualizamos el estado de React (la UI)
  setVariableExpenses(variableExpenses.filter(expense => expense.id !== id));
};

  const removeRealDebt = async (id) => {
  // 1. Eliminamos el registro directamente en la base de datos de Supabase
  const { error } = await supabase
    .from('finanzas_personales')
    .delete()
    .eq('id', id);

  // 2. Manejamos cualquier posible error (ej. problemas de conexión)
  if (error) {
    console.error("Error al eliminar la deuda:", error.message);
    return;
  }

  // 3. Si no hubo errores en Supabase, actualizamos el estado de React (la UI)
  setRealDebts(realDebts.filter(debt => debt.id !== id));
};

  // Determinar color y mensaje de salud financiera (relativo al umbral elegido por el usuario)
  const getFinancialHealth = () => {
    if (totalIncome === 0) return { color: 'text-gray-500', bg: 'bg-gray-100', text: 'Ingresa tus datos' };
    if (debtPercentage <= umbral) return { color: 'text-emerald-600', bg: 'bg-emerald-100', text: `Saludable (≤ ${umbral}%)` };
    if (debtPercentage <= umbral + 7) return { color: 'text-amber-500', bg: 'bg-amber-100', text: 'Precaución' };
    return { color: 'text-rose-500', bg: 'bg-rose-100', text: 'Riesgo' };
  };

  const healthStatus = getFinancialHealth();

  // Arma el resumen en Markdown con el estado actual (solo gastos fijos y deudas activos)
  const construirResumen = () =>
    generarResumenMarkdown({ incomes, debts, variableExpenses, realDebts, formatCurrency });

  // Copia el resumen al portapapeles. Devuelve true si tuvo éxito (para el feedback del botón).
  const copiarResumen = async () => {
    try {
      await navigator.clipboard.writeText(construirResumen());
      return true;
    } catch (e) {
      console.error("Error al copiar al portapapeles:", e);
      alert("No se pudo copiar. Revisa los permisos del navegador o usa 'Descargar .md'.");
      return false;
    }
  };

  // Descarga el resumen como archivo .md
  const descargarResumen = () => {
    const blob = new Blob([construirResumen()], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzas-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Función para llamar a Gemini API
  const generateAdvice = async () => {
    setIsLoadingAdvice(true);
    setAdviceError('');

    const url = '/api/getAdvice';

    // Lista los ítems de una categoría con su monto, para que la IA pueda dar consejos con cifras concretas
    const listarItems = (items) =>
      items.length
        ? items.map(i => `${i.concepto} (${formatCurrency(i.monto)})`).join('; ')
        : 'ninguno';

    const systemInstruction = `Eres un asesor financiero personal, empático y experto en finanzas personales para Colombia (moneda COP). Analizas el resumen estructurado de un usuario y respondes SIEMPRE en español, con tono cercano y motivador.

Distingue bien las cuatro categorías:
- Ingresos.
- Gastos fijos: necesarios y difíciles de recortar (arriendo, servicios).
- Gastos variables: ajustables, son la primera palanca para recortar.
- Deudas reales: cuotas mensuales de préstamos y tarjetas.

Estructura tu respuesta en Markdown así (sin tablas, sin títulos de nivel 1 o 2):
1. Un diagnóstico breve (2-3 frases) que compare su porcentaje de endeudamiento contra el umbral que EL PROPIO USUARIO definió como saludable, e indique si su dinero libre es positivo o negativo.
2. Una sección "### Consejos" con 3 o 4 viñetas. Cada consejo debe ser específico, accionable y con cifras concretas, refiriéndose a ítems por su nombre y monto cuando aporte valor.
3. Una frase final de ánimo.

Reglas para los consejos:
- Si el porcentaje de endeudamiento supera el umbral del usuario, prioriza estrategias para reducir las deudas reales.
- Si el dinero libre es negativo, el consejo principal debe ser cómo equilibrar el presupuesto, recortando primero gastos variables concretos y solo después gastos fijos.
- Usa el presupuesto semanal sugerido y el ahorro mensual sugerido que te da la app como referencia; no inventes otras cifras de referencia.
- Si el usuario desactivó el ahorro sugerido, respeta esa decisión: no lo regañes ni insistas en ahorrar un porcentaje fijo. Enfócate en que el gasto semanal le alcance y, como mucho, sugiere un ahorro pequeño y realista.
- Sé concreto y conciso; evita consejos genéricos.`;

    const userPrompt = `Estas son mis finanzas mensuales (moneda COP):

INGRESOS — Total: ${formatCurrency(totalIncome)}
Detalle: ${listarItems(incomes)}

GASTOS FIJOS (necesarios) — Total: ${formatCurrency(totalDebts)}
Detalle: ${listarItems(debts)}

GASTOS VARIABLES (ajustables) — Total: ${formatCurrency(totalVariableExpenses)}
Detalle: ${listarItems(variableExpenses)}

DEUDAS REALES (cuotas mensuales de préstamos/tarjetas) — Total: ${formatCurrency(totalRealDebts)}
Detalle: ${listarItems(realDebts)}

INDICADORES
- Dinero libre al mes: ${formatCurrency(freeMoney)}
- Porcentaje de endeudamiento (deudas reales sobre ingresos): ${debtPercentage}%
- Umbral que considero saludable: ${umbral}%
- Estado de salud según la app: ${healthStatus.text}
- Presupuesto semanal sugerido por la app: ${formatCurrency(weeklyBudget)}
- Ahorro mensual sugerido por la app: ${ahorroActivo
      ? `${formatCurrency(suggestedSavings)} (20% del dinero libre)`
      : 'desactivado por mí, porque ahora mismo no puedo ahorrar (todo el dinero libre va al gasto semanal)'}

Dame tu análisis y tus consejos.`;

    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.6, maxOutputTokens: 800 }
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
          <Navbar userName={userName} />
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
            title="Gastos Fijos"
            amount={formatCurrency(totalDebts)}
            icon={TrendingDown}
            iconColorClass="text-rose-500"
          />

          <TarjetaEstadistica
            title="Gastos Variables"
            amount={formatCurrency(totalVariableExpenses)}
            icon={ShoppingBag}
            iconColorClass="text-amber-500"
          />

          <TarjetaEstadistica
            title="Deudas"
            amount={formatCurrency(totalRealDebts)}
            icon={CreditCard}
            iconColorClass="text-violet-500"
          />
        </div>

        <TarjetaDineroLibre freeMoney={formatCurrency(freeMoney)} />

        {/* Panel de Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TarjetaEndeudamiento
            debtPercentage={debtPercentage}
            healthStatus={healthStatus}
            umbral={umbral}
            onUmbralInput={setUmbral}
            onUmbralCommit={guardarUmbral}
          />

          <TarjetaPresupuesto
            weeklyBudget={weeklyBudget}
            suggestedSavings={suggestedSavings}
            ahorroActivo={ahorroActivo}
            onToggleAhorro={toggleAhorro}
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
            updateIncome={updateIncome}
            formatCurrency={formatCurrency}
            guardarRegistro={guardarRegistro}
            onToggle={toggleIncome}
          />

          <GestorDeudas
            debts={debts}
            newDebt={newDebt}
            setNewDebt={setNewDebt}
            handleAddDebt={handleAddDebt}
            removeDebt={removeDebt}
            updateDebt={updateDebt}
            formatCurrency={formatCurrency}
            guardarRegistro={guardarRegistro}
            onToggle={toggleDebt}
            onToggleAll={toggleAllDebts}
          />
        </div>

        {/* Deudas reales y Gastos variables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GestorDeudasReales
            realDebts={realDebts}
            newRealDebt={newRealDebt}
            setNewRealDebt={setNewRealDebt}
            handleAddRealDebt={handleAddRealDebt}
            removeRealDebt={removeRealDebt}
            updateRealDebt={updateRealDebt}
            formatCurrency={formatCurrency}
            onToggle={toggleRealDebt}
            onToggleAll={toggleAllRealDebts}
          />

          <GestorGastosVariables
            variableExpenses={variableExpenses}
            newVariableExpense={newVariableExpense}
            setNewVariableExpense={setNewVariableExpense}
            handleAddVariableExpense={handleAddVariableExpense}
            removeVariableExpense={removeVariableExpense}
            updateVariableExpense={updateVariableExpense}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Dinero libre (resumen final, después de registrar todo) */}
        <TarjetaDineroLibre freeMoney={formatCurrency(freeMoney)} />

        <TarjetaExportar
          onCopiar={copiarResumen}
          onDescargar={descargarResumen}
        />

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