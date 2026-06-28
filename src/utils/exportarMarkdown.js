// Genera un resumen de las finanzas en formato Markdown, listo para pegar en una IA externa.
// Solo se incluyen los gastos fijos y deudas ACTIVOS (mismo criterio que los totales del Dashboard).

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
