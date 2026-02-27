export const formatTiempo = (segundos) => {
  if (!segundos || segundos === 0) return '-';
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const CATEGORIAS_COCINA = ['Entrada', 'Plato Principal'];

const esItemCocina = (item) => {
  if (item.esMenuExpandido) return CATEGORIAS_COCINA.includes(item.categoria);
  return true;
};

// ========== ESTADÍSTICAS POR CLIENTE ==========
export const calcularEstadisticasItems = (pedidos, filtroCliente = 'todos') => {
  const itemsMap = {};
  const pedidosFiltrados = filtroCliente === 'todos'
    ? pedidos
    : pedidos.filter(p => p.cliente === filtroCliente);

  pedidosFiltrados.forEach(pedido => {
    pedido.items.forEach(item => {
      if (!esItemCocina(item)) return;
      const key = item.nombre;
      if (!itemsMap[key]) {
        itemsMap[key] = { nombre: item.nombre, categoria: item.categoria || '', totalPendiente: 0, totalEnPreparacion: 0, totalGeneral: 0 };
      }
      itemsMap[key].totalGeneral += item.cantidad;
      if (pedido.estado === 'pendiente') itemsMap[key].totalPendiente += item.cantidad;
      else if (pedido.estado === 'en_preparacion') itemsMap[key].totalEnPreparacion += item.cantidad;
    });
  });

  return Object.values(itemsMap).sort((a, b) => b.totalGeneral - a.totalGeneral);
};

// ========== ESTADÍSTICAS POR DESTINO ==========
export const obtenerDestinosUnicos = (pedidos) => {
  const destinos = new Set();
  pedidos.forEach(p => { if (p.mesa) destinos.add(p.mesa); });
  return Array.from(destinos).sort();
};

export const calcularEstadisticasItemsPorDestino = (pedidos, filtroDestino = 'todos') => {
  const itemsMap = {};
  const pedidosFiltrados = filtroDestino === 'todos'
    ? pedidos
    : pedidos.filter(p => p.mesa === filtroDestino);

  pedidosFiltrados.forEach(pedido => {
    pedido.items.forEach(item => {
      if (!esItemCocina(item)) return;
      const key = item.nombre;
      if (!itemsMap[key]) {
        itemsMap[key] = { nombre: item.nombre, categoria: item.categoria || '', totalPendiente: 0, totalEnPreparacion: 0, totalGeneral: 0 };
      }
      itemsMap[key].totalGeneral += item.cantidad;
      if (pedido.estado === 'pendiente') itemsMap[key].totalPendiente += item.cantidad;
      else if (pedido.estado === 'en_preparacion') itemsMap[key].totalEnPreparacion += item.cantidad;
    });
  });

  return Object.values(itemsMap).sort((a, b) => b.totalGeneral - a.totalGeneral);
};

export const calcularEstadisticasTipo = (pedidos) => {
  const stats = { MESA: 0, DELIVERY: 0, OTRO: 0 };
  pedidos.forEach(pedido => { stats[getDestino(pedido.mesa)] += 1; });
  return stats;
};

export const obtenerClientesUnicos = (pedidos) => {
  const clientes = new Set();
  pedidos.forEach(p => { if (p.cliente) clientes.add(p.cliente); });
  return Array.from(clientes).sort();
};

export const filtrarPedidos = (pedidos, filtroMesero, filtroCliente) => {
  return pedidos.filter(pedido => {
    const pasaMesero = filtroMesero === 'todos' ||
      (pedido.usuarioCreador && pedido.usuarioCreador._id === filtroMesero);
    const pasaCliente = filtroCliente === 'todos' || pedido.cliente === filtroCliente;
    return pasaMesero && pasaCliente;
  });
};

export const obtenerMeserosUnicos = (pedidos) => {
  const meserosMap = new Map();
  pedidos.forEach(pedido => {
    if (pedido.usuarioCreador && pedido.usuarioCreador._id) {
      meserosMap.set(pedido.usuarioCreador._id, { _id: pedido.usuarioCreador._id, nombre: pedido.usuarioCreador.nombre });
    }
  });
  return Array.from(meserosMap.values());
};