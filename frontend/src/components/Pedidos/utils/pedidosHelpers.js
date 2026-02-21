export const formatFechaCompleta = (fecha) => {
  if (!fecha) return '-';
  const date = new Date(fecha);
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dia = dias[date.getDay()];
  const fechaStr = date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${dia} ${fechaStr}`;
};

export const formatHoraSola = (fecha) => {
  if (!fecha) return '-';
  const date = new Date(fecha);
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const calcularTiempoPreparacion = (inicio, fin) => {
  if (!inicio || !fin) return '-';
  const inicioDate = new Date(inicio);
  const finDate = new Date(fin);
  const diff = Math.floor((finDate - inicioDate) / 1000);
  
  const horas = Math.floor(diff / 3600);
  const minutos = Math.floor((diff % 3600) / 60);
  const segundos = diff % 60;
  
  const partes = [];
  if (horas > 0) partes.push(`${horas.toString().padStart(2, '0')}`);
  partes.push(`${minutos.toString().padStart(2, '0')}`);
  partes.push(`${segundos.toString().padStart(2, '0')}`);
  
  return partes.join(':');
};

export const getEstadoLabel = (estado) => {
  const labels = {
    'pendiente': 'Pendiente',
    'en_preparacion': 'En Preparación',
    'completado': 'Completado',
    'cancelado': 'Cancelado'
  };
  return labels[estado] || estado;
};

export const getNombreUsuario = (usuarioData) => {
  if (!usuarioData) return 'Sistema';
  
  if (typeof usuarioData === 'string') {
    try {
      const parsed = JSON.parse(usuarioData);
      return parsed.nombre || 'Sistema';
    } catch (e) {
      return usuarioData;
    }
  }
  
  if (typeof usuarioData === 'object' && usuarioData.nombre) {
    return usuarioData.nombre;
  }
  
  return 'Sistema';
};

export const getFechaActual = (filtroFecha, fechaPersonalizada) => {
  if (filtroFecha === 'hoy') {
    const hoy = new Date();
    return hoy.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  if (filtroFecha === 'ayer') {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    return ayer.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  if (filtroFecha === 'personalizado' && fechaPersonalizada) {
    const date = new Date(fechaPersonalizada + 'T00:00:00');
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return '';
};

export const calcularEstadisticas = (pedidos, filtroEstado, filtroUsuario) => {
  const pedidosFiltrados = pedidos.filter(p => {
    let pasaEstado = false;
    if (filtroEstado === 'todos') pasaEstado = !p.cancelado;
    if (filtroEstado === 'pendientes') pasaEstado = p.estado === 'pendiente' && !p.cancelado;
    if (filtroEstado === 'en_preparacion') pasaEstado = p.estado === 'en_preparacion' && !p.cancelado;
    if (filtroEstado === 'completados') pasaEstado = p.estado === 'completado' && !p.cancelado;
    if (filtroEstado === 'por_cobrar') pasaEstado = p.estadoPago === 'pendiente' && !p.cancelado;
    if (filtroEstado === 'cancelados') pasaEstado = p.cancelado;
    
    let pasaUsuario = true;
    if (filtroUsuario !== 'todos' && p.usuarioCreador && p.usuarioCreador._id) {
      pasaUsuario = p.usuarioCreador._id === filtroUsuario;
    }
    
    return pasaEstado && pasaUsuario;
  });

  return {
    pedidosFiltrados,
    total: pedidosFiltrados.filter(p => !p.cancelado).length,
    pendientes: pedidosFiltrados.filter(p => p.estado === 'pendiente' && !p.cancelado).length,
    enPreparacion: pedidosFiltrados.filter(p => p.estado === 'en_preparacion' && !p.cancelado).length,
    completados: pedidosFiltrados.filter(p => p.estado === 'completado' && !p.cancelado).length,
    porCobrar: pedidosFiltrados.filter(p => p.estadoPago === 'pendiente' && !p.cancelado).length,
    cancelados: pedidosFiltrados.filter(p => p.cancelado).length,
    totalVentas: pedidosFiltrados.filter(p => !p.cancelado).reduce((sum, p) => sum + p.total, 0)
  };
};