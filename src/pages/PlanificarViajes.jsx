import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { formatCurrency } from '../utils/format';
import { GASTOS_SUGERIDOS, totalViaje } from '../utils/viajes';
import { generarResumenViajeMarkdown } from '../utils/exportarMarkdown';

import Navbar from '../components/Navbar';
import GestorViajes from '../components/GestorViajes';
import GestorGastosViaje from '../components/GestorGastosViaje';
import TarjetaResumenViaje from '../components/TarjetaResumenViaje';

export default function PlanificarViajes() {
  const [userName, setUserName] = useState('Usuario');

  const [viajes, setViajes] = useState([]);
  const [gastos, setGastos] = useState([]); // todos los gastos del usuario (de todos sus viajes)
  const [viajeActivoId, setViajeActivoId] = useState(null);

  const [newViaje, setNewViaje] = useState({ name: '', dias: '' });
  const [newGasto, setNewGasto] = useState({ name: '', amount: '', porDia: false });

  // Datos derivados del viaje activo
  const viajeActivo = useMemo(
    () => viajes.find((v) => v.id === viajeActivoId) || null,
    [viajes, viajeActivoId]
  );
  const gastosActivos = useMemo(
    () => gastos.filter((g) => g.viaje_id === viajeActivoId),
    [gastos, viajeActivoId]
  );
  const totalActivo = useMemo(
    () => (viajeActivo ? totalViaje(gastosActivos, viajeActivo.duracion_dias) : 0),
    [gastosActivos, viajeActivo]
  );

  // Carga inicial: nombre del usuario, viajes y gastos
  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const nombre =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      'Usuario';
    setUserName(nombre);

    const { data: viajesData, error: viajesError } = await supabase
      .from('viajes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (viajesError) {
      console.error('Error al cargar viajes:', viajesError.message);
      return;
    }

    const { data: gastosData, error: gastosError } = await supabase
      .from('viajes_gastos')
      .select('*')
      .eq('user_id', user.id);

    if (gastosError) {
      console.error('Error al cargar gastos de viajes:', gastosError.message);
      return;
    }

    setViajes(viajesData);
    setGastos(gastosData);
    if (viajesData.length > 0) setViajeActivoId(viajesData[0].id);
  };

  useEffect(() => {
    // Carga de datos al montar; los setState ocurren tras await (de forma asíncrona),
    // por lo que no provocan renders en cascada. La regla no rastrea el await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos();
  }, []);

  // Crear viaje y sembrar la plantilla de gastos sugeridos
  const handleAddViaje = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dias = Math.max(parseInt(newViaje.dias, 10) || 1, 1);

    const { data: viajeData, error: viajeError } = await supabase
      .from('viajes')
      .insert([{ user_id: user.id, concepto: newViaje.name.trim(), duracion_dias: dias }])
      .select();

    if (viajeError || !viajeData) {
      console.error('Error al crear el viaje:', viajeError?.message);
      alert('No se pudo crear el viaje. Intenta de nuevo.');
      return;
    }

    const nuevoViaje = viajeData[0];

    // Sembramos los gastos estándar sugeridos
    const filasGastos = GASTOS_SUGERIDOS.map((g) => ({
      viaje_id: nuevoViaje.id,
      user_id: user.id,
      concepto: g.concepto,
      monto: g.monto,
      por_dia: g.por_dia,
    }));

    const { data: gastosData, error: gastosError } = await supabase
      .from('viajes_gastos')
      .insert(filasGastos)
      .select();

    if (gastosError) console.error('Error al sembrar los gastos sugeridos:', gastosError.message);

    setViajes((prev) => [...prev, nuevoViaje]);
    if (gastosData) setGastos((prev) => [...prev, ...gastosData]);
    setViajeActivoId(nuevoViaje.id);
    setNewViaje({ name: '', dias: '' });
  };

  const removeViaje = async (id) => {
    const { error } = await supabase.from('viajes').delete().eq('id', id);
    if (error) {
      console.error('Error al eliminar el viaje:', error.message);
      return;
    }
    const restantes = viajes.filter((v) => v.id !== id);
    setViajes(restantes);
    setGastos((prev) => prev.filter((g) => g.viaje_id !== id)); // los hijos ya cayeron por cascade
    if (viajeActivoId === id) {
      setViajeActivoId(restantes.length > 0 ? restantes[0].id : null);
    }
  };

  // Gastos del viaje activo
  const handleAddGasto = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !viajeActivoId) return;

    const { data, error } = await supabase
      .from('viajes_gastos')
      .insert([{
        viaje_id: viajeActivoId,
        user_id: user.id,
        concepto: newGasto.name.trim(),
        monto: Number(newGasto.amount),
        por_dia: newGasto.porDia,
      }])
      .select();

    if (error || !data) {
      console.error('Error al guardar el gasto:', error?.message);
      return;
    }

    setGastos((prev) => [...prev, data[0]]);
    setNewGasto({ name: '', amount: '', porDia: false });
  };

  const removeGasto = async (id) => {
    const { error } = await supabase.from('viajes_gastos').delete().eq('id', id);
    if (error) {
      console.error('Error al eliminar el gasto:', error.message);
      return;
    }
    setGastos((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGasto = async (id, concepto, monto, porDia) => {
    const { data, error } = await supabase
      .from('viajes_gastos')
      .update({ concepto, monto, por_dia: porDia })
      .eq('id', id)
      .select();

    if (error || !data) {
      console.error('Error al actualizar el gasto:', error?.message);
      alert('No se pudo actualizar el gasto. Intenta de nuevo.');
      return;
    }
    setGastos((prev) => prev.map((g) => (g.id === id ? data[0] : g)));
  };

  // Comparte los gastos del viaje activo como Markdown simple. En móvil abre el menú
  // nativo (WhatsApp, Telegram...); si no está disponible, copia al portapapeles.
  // Devuelve true solo cuando se copió, para el feedback "¡Copiado!" del botón.
  const compartirGastos = async () => {
    if (!viajeActivo) return false;

    const texto = generarResumenViajeMarkdown({
      viaje: viajeActivo,
      gastos: gastosActivos,
      formatCurrency,
    });

    if (navigator.share) {
      try {
        await navigator.share({ text: texto });
        return false; // el menú nativo ya da su propio feedback
      } catch (e) {
        if (e.name === 'AbortError') return false; // el usuario cerró el menú
        // Cualquier otro fallo: seguimos con el portapapeles
      }
    }

    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch (e) {
      console.error('Error al copiar al portapapeles:', e);
      alert('No se pudo copiar. Revisa los permisos del navegador.');
      return false;
    }
  };

  // Meta de ahorro y abonos del viaje activo
  const actualizarViaje = async (id, cambios) => {
    const { data, error } = await supabase
      .from('viajes')
      .update(cambios)
      .eq('id', id)
      .select();

    if (error || !data) {
      console.error('Error al actualizar el viaje:', error?.message);
      alert('No se pudo guardar el cambio. Intenta de nuevo.');
      return;
    }
    setViajes((prev) => prev.map((v) => (v.id === id ? data[0] : v)));
  };

  const guardarMeta = (monto, frecuencia) =>
    actualizarViaje(viajeActivoId, { ahorro_monto: monto, ahorro_frecuencia: frecuencia });

  const registrarAhorro = (monto) =>
    actualizarViaje(viajeActivoId, { ahorrado: (viajeActivo?.ahorrado || 0) + monto });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8">
          <Navbar userName={userName} />
          <p className="text-slate-500 mt-10">
            Planifica tus viajes: define una meta, estima los gastos y descubre cuándo podrás viajar
            según tu ahorro.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GestorViajes
            viajes={viajes}
            gastos={gastos}
            viajeActivoId={viajeActivoId}
            onSelect={setViajeActivoId}
            newViaje={newViaje}
            setNewViaje={setNewViaje}
            handleAddViaje={handleAddViaje}
            removeViaje={removeViaje}
            formatCurrency={formatCurrency}
          />

          {viajeActivo ? (
            <GestorGastosViaje
              gastos={gastosActivos}
              dias={viajeActivo.duracion_dias}
              newGasto={newGasto}
              setNewGasto={setNewGasto}
              handleAddGasto={handleAddGasto}
              removeGasto={removeGasto}
              updateGasto={updateGasto}
              onCompartir={compartirGastos}
              formatCurrency={formatCurrency}
            />
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
              <p className="text-center text-slate-400 text-sm">
                Crea o selecciona un viaje para gestionar sus gastos.
              </p>
            </div>
          )}
        </div>

        {viajeActivo && (
          <TarjetaResumenViaje
            key={viajeActivo.id}
            viaje={viajeActivo}
            total={totalActivo}
            onGuardarMeta={guardarMeta}
            onRegistrarAhorro={registrarAhorro}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}
