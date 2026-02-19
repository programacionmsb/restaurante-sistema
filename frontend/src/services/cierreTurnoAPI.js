const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const cierreTurnoAPI = {
  // Generar cierre de turno
  generarCierre: async (usuarioId) => {
    const response = await fetch(`${API_URL}/api/cierres-turno`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuarioId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al generar cierre');
    }
    
    return response.json();
  },

  // Registrar entrega de efectivo
  registrarEntrega: async (cierreId, datos) => {
    const response = await fetch(`${API_URL}/api/cierres-turno/${cierreId}/entregar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al registrar entrega');
    }
    
    return response.json();
  },

  // Obtener cierres de un usuario
  getCierresPorUsuario: async (usuarioId, limite = 10) => {
    const response = await fetch(`${API_URL}/api/cierres-turno/usuario/${usuarioId}?limite=${limite}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener cierres');
    }
    
    return response.json();
  },

  // Verificar si tiene cierre pendiente
  verificarCierrePendiente: async (usuarioId) => {
    const response = await fetch(`${API_URL}/api/cierres-turno/usuario/${usuarioId}/pendiente`);
    
    if (!response.ok) {
      throw new Error('Error al verificar cierre pendiente');
    }
    
    return response.json();
  },

  // Obtener todos los cierres (admin)
  getAllCierres: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId);
    if (filtros.limite) params.append('limite', filtros.limite);

    const response = await fetch(`${API_URL}/api/cierres-turno?${params}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener cierres');
    }
    
    return response.json();
  },

  // Obtener cierre por ID
  getCierrePorId: async (id) => {
    const response = await fetch(`${API_URL}/api/cierres-turno/${id}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener cierre');
    }
    
    return response.json();
  },
};

export default cierreTurnoAPI;
