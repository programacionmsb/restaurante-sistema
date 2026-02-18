const API_URL = 'https://restaurante-backend-a6o9.onrender.com/api'

// Servicio de Roles
export const rolesAPI = {
  // Obtener todos los roles
  getAll: async () => {
    const response = await fetch(`${API_URL}/roles`);
    if (!response.ok) throw new Error('Error al cargar roles');
    return await response.json();
  },

  // Obtener permisos disponibles
  getPermisosDisponibles: async () => {
    const response = await fetch(`${API_URL}/roles/permisos-disponibles`);
    if (!response.ok) throw new Error('Error al cargar permisos');
    return await response.json();
  },

  // Obtener un rol por ID
  getById: async (id) => {
    const response = await fetch(`${API_URL}/roles/${id}`);
    if (!response.ok) throw new Error('Error al cargar rol');
    return await response.json();
  },

  // Crear nuevo rol
  create: async (rolData) => {
    const response = await fetch(`${API_URL}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rolData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear rol');
    }
    return await response.json();
  },

  // Actualizar rol
  update: async (id, rolData) => {
    const response = await fetch(`${API_URL}/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rolData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar rol');
    }
    return await response.json();
  },

  // Eliminar rol
  delete: async (id) => {
    const response = await fetch(`${API_URL}/roles/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar rol');
    }
    return await response.json();
  }
};