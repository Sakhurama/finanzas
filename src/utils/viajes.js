// Lógica de cálculo para la planificación de viajes.

// Plantilla de gastos sugeridos al crear un viaje nuevo.
// por_dia = true significa que el monto se multiplica por la duración del viaje.
export const GASTOS_SUGERIDOS = [
  { concepto: 'Comida', monto: 50000, por_dia: true },
  { concepto: 'Hotel', monto: 120000, por_dia: true },
  { concepto: 'Actividades', monto: 80000, por_dia: false },
  { concepto: 'Gasolina', monto: 60000, por_dia: false },
  { concepto: 'Peajes', monto: 30000, por_dia: false },
];

// Etiquetas legibles para la frecuencia de ahorro.
export const FRECUENCIAS = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
};

// Nombre del periodo (singular/plural) según la frecuencia, para textos como "en 3 semanas".
const NOMBRES_PERIODO = {
  semanal: ['semana', 'semanas'],
  quincenal: ['quincena', 'quincenas'],
  mensual: ['mes', 'meses'],
};

export const nombrePeriodo = (frecuencia, n) => {
  const [sing, plur] = NOMBRES_PERIODO[frecuencia] || NOMBRES_PERIODO.semanal;
  return n === 1 ? sing : plur;
};

// Subtotal de un gasto: si es "por día" se multiplica por la duración del viaje.
export const subtotalGasto = (gasto, dias) =>
  gasto.por_dia ? gasto.monto * dias : gasto.monto;

// Total del viaje: suma de los subtotales de todos los gastos.
export const totalViaje = (gastos, dias) =>
  gastos.reduce((acc, g) => acc + subtotalGasto(g, dias), 0);

// Porcentaje de progreso del ahorro (0-100).
export const progresoPct = (ahorrado, total) =>
  total > 0 ? Math.min(100, Math.round((ahorrado / total) * 100)) : 0;

// Calcula la fecha más próxima en la que se reúne el total, según la cuota
// de ahorro comprometida y su frecuencia. Tiene en cuenta lo ya ahorrado.
export const calcularFechaViaje = ({ total, ahorrado, ahorroMonto, frecuencia, desde = new Date() }) => {
  const falta = Math.max(total - ahorrado, 0);

  // Ya se alcanzó la meta: el viaje se puede hacer hoy.
  if (falta === 0) {
    return { fecha: new Date(desde), periodos: 0, falta: 0, completado: true };
  }

  // Sin una cuota de ahorro válida no es posible estimar una fecha.
  if (!ahorroMonto || ahorroMonto <= 0) {
    return { fecha: null, periodos: null, falta, completado: false };
  }

  const periodos = Math.ceil(falta / ahorroMonto);
  const fecha = new Date(desde);

  if (frecuencia === 'mensual') {
    fecha.setMonth(fecha.getMonth() + periodos);
  } else {
    const dias = frecuencia === 'quincenal' ? 15 : 7;
    fecha.setDate(fecha.getDate() + dias * periodos);
  }

  return { fecha, periodos, falta, completado: false };
};

// Formatea una fecha a texto legible en español (es-CO).
export const formatFecha = (fecha) =>
  fecha
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(fecha)
    : '—';
