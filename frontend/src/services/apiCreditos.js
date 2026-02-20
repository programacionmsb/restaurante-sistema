const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const creditosAPI = {
  // Obtener clientes con deuda
  getClientesConDeuda: async (usuarioId, permisos) => {
    const params = new URLSearchParams();
    params.append('usuarioId', usuarioId);
    if (permisos && permisos.length > 0) {
      params.append('permisos', permisos.join(','));
    }

    const response = await fetch(`${API_URL}/api/creditos/clientes?${params}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener clientes con deuda');
    }
    
    return response.json();
  },

  // Obtener pedidos de un cliente específico
  getPedidosCliente: async (nombreCliente, usuarioId, permisos) => {
    const params = new URLSearchParams();
    params.append('usuarioId', usuarioId);
    if (permisos && permisos.length > 0) {
      params.append('permisos', permisos.join(','));
    }

    const response = await fetch(`${API_URL}/api/creditos/cliente/${encodeURIComponent(nombreCliente)}?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener pedidos del cliente');
    }
    
    return response.json();
  },

  // Procesar pago de crédito
  procesarPago: async (datos) => {
    const response = await fetch(`${API_URL}/api/creditos/pagar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al procesar pago');
    }
    
    return response.json();
  },

  // Crear crédito
  crearCredito: async (datos) => {
    const response = await fetch(`${API_URL}/api/creditos/crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear crédito');
    }
    
    return response.json();
  },

  // Obtener reporte de créditos
  getReporteCreditos: async (usuarioId, permisos) => {
    const params = new URLSearchParams();
    params.append('usuarioId', usuarioId);
    if (permisos && permisos.length > 0) {
      params.append('permisos', permisos.join(','));
    }

    const response = await fetch(`${API_URL}/api/creditos/reporte?${params}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener reporte');
    }
    
    return response.json();
  },
};

export { creditosAPI };