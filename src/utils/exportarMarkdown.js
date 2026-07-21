// Genera un resumen de las finanzas en formato Markdown, listo para pegar en una IA externa.
// Solo se incluyen los gastos fijos y deudas ACTIVOS (mismo criterio que los totales del Dashboard).

import { subtotalGasto, totalViaje } from './viajes';

const estaActivo = (item) => item.activo !== false;

// Construye una sección: encabezado con total + lista de ítems (o "Sin registros").
const seccion = (titulo, items, formatCurrency) => {
  const total = items.reduce((acc, curr) => acc + curr.monto, 0);
  const lineas = items.length
    ? items.map((i) => `- ${i.concepto}: ${formatCurrency(i.monto)}`).join('\n')
    : '_Sin registros._';
  return `## ${titulo} (Total: ${formatCurrency(total)})\n${lineas}`;
};

export const generarResumenMarkdown = ({ incomes, debts, variableExpenses, realDebts, formatCurrency }) => {
  const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date());

  const gastosFijosActivos = debts.filter(estaActivo);
  const deudasActivas = realDebts.filter(estaActivo);

  return [
    `# Resumen financiero — ${fecha}`,
    seccion('Ingresos', incomes, formatCurrency),
    seccion('Gastos fijos activos', gastosFijosActivos, formatCurrency),
    seccion('Gastos variables', variableExpenses, formatCurrency),
    seccion('Deudas activas', deudasActivas, formatCurrency),
  ].join('\n\n');
};

// Genera los gastos de un viaje en Markdown simple, pensado para compartir por chat
// (WhatsApp y similares): sin encabezados ni tablas, solo negritas y viñetas, que es
// lo único que esas apps saben renderizar.
export const generarResumenViajeMarkdown = ({ viaje, gastos, formatCurrency }) => {
  const dias = viaje.duracion_dias;
  const plural = dias === 1 ? 'día' : 'días';

  const lineas = gastos.length
    ? gastos
        .map((g) => {
          // En los gastos por día mostramos el desglose para que se entienda el subtotal.
          const detalle = g.por_dia ? ` (${formatCurrency(g.monto)} x ${dias} ${plural})` : '';
          return `- ${g.concepto}: ${formatCurrency(subtotalGasto(g, dias))}${detalle}`;
        })
        .join('\n')
    : '_Sin gastos registrados._';

  return [
    `*${viaje.concepto}* — ${dias} ${plural}`,
    lineas,
    `*Total estimado: ${formatCurrency(totalViaje(gastos, dias))}*`,
  ].join('\n\n');
};
