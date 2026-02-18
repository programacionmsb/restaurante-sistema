const API_URL = 'https://turbo-dollop-g456jw96qpwqfg7x-5000.app.github.dev/api';

export const menuAPI = {
  // Obtener menús de hoy (retorna array)
  getHoy: async () => {
    const response = await fetch(`${API_URL}/menu-dia/hoy`);
    if (!response.ok) {
      throw new Error('Error al cargar menús');
    }
    return await response.json();
  },

  // Obtener menús por fecha (retorna array)
  getByFecha: async (fecha) => {
    const response = await fetch(`${API_URL}/menu-dia/fecha/${fecha}`);
    if (!response.ok) {
      throw new Error('Error al cargar menús');
    }
    return await response.json();
  },

  // Obtener un menú específico por ID
  getById: async (id) => {
    const response = await fetch(`${API_URL}/menu-dia/${id}`);
    if (!response.ok) {
      throw new Error('Error al cargar menú');
    }
    return await response.json();
  },

  // Obtener todos los menús
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.activo !== undefined) queryParams.append('activo', params.activo);
    
    const url = `${API_URL}/menu-dia${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Error al cargar menús');
    }
    return await response.json();
  },

  // Crear nuevo menú
  create: async (menuData) => {
    const response = await fetch(`${API_URL}/menu-dia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear menú');
    }
    return await response.json();
  },

  // Actualizar menú existente
  update: async (id, menuData) => {
    const response = await fetch(`${API_URL}/menu-dia/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar menú');
    }
    return await response.json();
  },

  // Eliminar menú
  delete: async (id) => {
    const response = await fetch(`${API_URL}/menu-dia/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar menú');
    }
    return await response.json();
  },

  // Activar/Desactivar menú
  toggle: async (id) => {
    const response = await fetch(`${API_URL}/menu-dia/${id}/toggle`, {
      method: 'PATCH'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al cambiar estado del menú');
    }
    return await response.json();
  },

  // Obtener menús por rango de fechas
getPorRango: async (fechaInicio, fechaFin) => {
  const response = await fetch(`${API_URL}/menu-dia?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  if (!response.ok) {
    throw new Error('Error al cargar menús');
  }
  return await response.json();
},

  // Actualizar disponibilidad de plato
  updatePlatoDisponibilidad: async (menuId, platoId, disponible) => {
    const response = await fetch(`${API_URL}/menu-dia/${menuId}/plato/${platoId}/disponibilidad`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponible })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar disponibilidad');
    }
    return await response.json();
  }
};
