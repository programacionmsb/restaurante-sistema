export const formatTiempo = (segundos) => {
  if (!segundos || segundos === 0) return '-';
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const CATEGORIAS_COCINA = ['Entrada', 'Plato Principal'];

// Determina si un item debe mostrarse en el resumen de cocina
const esItemCocina = (item) => {
  if (item.esMenuExpandido) {
    return CATEGORIAS_COCINA.includes(item.categoria);
  }
  // Items normales (no de menú): mostrar todos
  return true;
};

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
        itemsMap[key] = {
          nombre: item.nombre,
          categoria: item.categoria || '',
          totalPendiente: 0,
          totalEnPreparacion: 0,
          totalGeneral: 0
        };
      }

      const cantidad = item.cantidad;
      itemsMap[key].totalGeneral += cantidad;

      if (pedido.estado === 'pendiente') {
        itemsMap[key].totalPendiente += cantidad;
      } else if (pedido.estado === 'en_preparacion') {
        itemsMap[key].totalEnPreparacion += cantidad;
      }
    });
  });

  return Object.values(itemsMap).sort((a, b) => b.totalGeneral - a.totalGeneral);
};

export const obtenerClientesUnicos = (pedidos) => {
  const clientes = new Set();
  pedidos.forEach(p => { if (p.cliente) clientes.add(p.cliente); });
  return Array.from(clientes).sort();
};

export const filtrarPedidos = (pedidos, filtroMesero, busquedaCliente) => {
  return pedidos.filter(pedido => {
    const pasaMesero = filtroMesero === 'todos' ||
      (pedido.usuarioCreador && pedido.usuarioCreador._id === filtroMesero);
    const pasaCliente = !busquedaCliente ||
      pedido.cliente.toLowerCase().includes(busquedaCliente.toLowerCase());
    return pasaMesero && pasaCliente;
  });
};

export const obtenerMeserosUnicos = (pedidos) => {
  const meserosMap = new Map();
  pedidos.forEach(pedido => {
    if (pedido.usuarioCreador && pedido.usuarioCreador._id) {
      meserosMap.set(pedido.usuarioCreador._id, {
        _id: pedido.usuarioCreador._id,
        nombre: pedido.usuarioCreador.nombre
      });
    }
  });
  return Array.from(meserosMap.values());
};