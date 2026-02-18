const API_URL = 'https://turbo-dollop-g456jw96qpwqfg7x-5000.app.github.dev/api';

// Servicio de Pedidos
export const pedidosAPI = {
  // Obtener pedidos del día
  getHoy: async () => {
    const response = await fetch(`${API_URL}/pedidos/hoy`);
    if (!response.ok) throw new Error('Error al cargar pedidos');
    return await response.json();
  },

  // Obtener pedidos por rango de fechas
  getPorRango: async (fechaInicio, fechaFin) => {
    const response = await fetch(
      `${API_URL}/pedidos/rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    if (!response.ok) throw new Error('Error al cargar pedidos por rango');
    return await response.json();
  },

  // Crear nuevo pedido
  create: async (pedidoData) => {
    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
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