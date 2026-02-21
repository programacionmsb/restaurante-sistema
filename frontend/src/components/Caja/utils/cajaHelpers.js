export const calcularEstadisticasCaja = (pedidos) => {
  const pedidosCompletados = pedidos.filter(p => p.estado === 'completado');
  const pedidosPorCobrar = pedidosCompletados.filter(p => p.estadoPago === 'pendiente');
  const pedidosPagados = pedidosCompletados.filter(p => p.estadoPago === 'pagado');
  const pedidosCredito = pedidosCompletados.filter(p => p.estadoPago === 'credito');

  const totalPorCobrar = pedidosPorCobrar.reduce((sum, p) => sum + p.total, 0);
  const totalCobrado = pedidosPagados.reduce((sum, p) => sum + p.total, 0);
  const totalCredito = pedidosCredito.reduce((sum, p) => sum + p.total, 0);

  const porEfectivo = pedidosPagados.filter(p => p.metodoPago === 'efectivo').reduce((sum, p) => sum + p.total, 0);
  const porYape = pedidosPagados.filter(p => p.metodoPago === 'yape').reduce((sum, p) => sum + p.total, 0);
  const porTransferencia = pedidosPagados.filter(p => p.metodoPago === 'transferencia').reduce((sum, p) => sum + p.total, 0);

  const totalDescuentos = pedidosPagados.reduce((sum, p) => sum + (p.totalDescuentos || 0), 0);

  return {
    pedidosCompletados,
    pedidosPorCobrar,
    pedidosPagados,
    pedidosCredito,
    totalPorCobrar,
    totalCobrado,
    totalCredito,
    porEfectivo,
    porYape,
    porTransferencia,
    totalDescuentos
  };
};

export const formatHora = (fecha) => {
  if (!fecha) return '-';
  const date = new Date(fecha);
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};

export const getFiltroFechaLabel = (filtroFecha, fechaPersonalizada) => {
  if (filtroFecha === 'hoy') return 'Hoy';
  if (filtroFecha === 'ayer') return 'Ayer';
  if (filtroFecha === 'ultimos7') return 'Últimos 7 días';
  if (filtroFecha === 'ultimos30') return 'Últimos 30 días';
  if (filtroFecha === 'personalizado' && fechaPersonalizada) {
    const date = new Date(fechaPersonalizada);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return 'Seleccionar Fecha';
};