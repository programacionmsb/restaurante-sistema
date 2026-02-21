export const formatTiempo = (segundos) => {
  if (!segundos || segundos === 0) return '-';
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const calcularEstadisticasItems = (pedidos) => {
  const itemsMap = {};

  pedidos.forEach(pedido => {
    pedido.items.forEach(item => {
      if (!itemsMap[item.nombre]) {
        itemsMap[item.nombre] = {
          nombre: item.nombre,
          totalPendiente: 0,
          totalEnPreparacion: 0,
          totalGeneral: 0
        };
      }

      const cantidad = item.cantidad;
      itemsMap[item.nombre].totalGeneral += cantidad;

      if (pedido.estado === 'pendiente') {
        itemsMap[item.nombre].totalPendiente += cantidad;
      } else if (pedido.estado === 'en_preparacion') {
        itemsMap[item.nombre].totalEnPreparacion += cantidad;
      }
    });
  });

  return Object.values(itemsMap).sort((a, b) => b.totalGeneral - a.totalGeneral);
};

export const filtrarPedidos = (pedidos, filtroMesero, busquedaCliente) => {
  return pedidos.filter(pedido => {
    // Filtro por mesero
    const pasaMesero = filtroMesero === 'todos' || 
      (pedido.usuarioCreador && pedido.usuarioCreador._id === filtroMesero);

    // Búsqueda por cliente
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