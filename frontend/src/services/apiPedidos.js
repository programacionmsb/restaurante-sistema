const API_URL = 'https://restaurante-backend-a6o9.onrender.com/api'

// Servicio de Pedidos
export const pedidosAPI = {
  // Obtener pedidos del día (con filtro de usuario)
  getHoy: async () => {
    // Obtener usuario actual
    const userStr = localStorage.getItem('usuario');
    let userId = null;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user._id;
      } catch (e) {
        console.error('Error al obtener usuario:', e);
      }
    }
    
    const url = userId ? `${API_URL}/pedidos/hoy?usuarioId=${userId}` : `${API_URL}/pedidos/hoy`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al cargar pedidos');
    return await response.json();
  },

  // Obtener pedidos por rango de fechas (con filtro de usuario)
  getPorRango: async (fechaInicio, fechaFin) => {
    // Obtener usuario actual
    const userStr = localStorage.getItem('usuario');
    let userId = null;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user._id;
      } catch (e) {
        console.error('Error al obtener usuario:', e);
      }
    }
    
    const params = new URLSearchParams({
      fechaInicio,
      fechaFin
    });
    
    if (userId) {
      params.append('usuarioId', userId);
    }
    
    const response = await fetch(`${API_URL}/pedidos/rango?${params.toString()}`);
    if (!response.ok) throw new Error('Error al cargar pedidos por rango');
    return await response.json();
  },

  // Crear nuevo pedido (con usuario creador)
  create: async (pedidoData) => {
    // Obtener usuario actual
    const userStr = localStorage.getItem('usuario');
    let usuarioCreador = null;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        usuarioCreador = {
          _id: user._id,
          nombre: user.nombre,
          usuario: user.usuario
        };
      } catch (e) {
        console.error('Error al obtener usuario:', e);
      }
    }
    
    // Agregar usuario creador al pedido
    const pedidoConUsuario = {
      ...pedidoData,
      usuarioCreador
    };
    
    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoConUsuario)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear pedido');
    }
    return await response.json();
  },

  // Editar pedido (solo pendientes)
  update: async (id, pedidoData) => {
    const response = await fetch(`${API_URL}/pedidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al editar pedido');
    }
    return await response.json();
  },

  // Cancelar pedido
  cancelar: async (id, motivo, usuario) => {
    const response = await fetch(`${API_URL}/pedidos/${id}/cancelar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo, usuario })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al cancelar pedido');
    }
    return await response.json();
  },

  // Actualizar estado del pedido (cocina)
  updateEstado: async (id, estado) => {
    const response = await fetch(`${API_URL}/pedidos/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar estado');
    }
    return await response.json();
  },

  // Registrar pago (caja)
  registrarPago: async (id, metodoPago) => {
    const response = await fetch(`${API_URL}/pedidos/${id}/pago`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estadoPago: 'pagado', metodoPago })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al registrar pago');
    }
    return await response.json();
  }
};