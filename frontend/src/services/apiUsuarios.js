const API_URL = 'https://restaurante-backend-a6o9.onrender.com'

// Servicio de Usuarios
export const usuariosAPI = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await fetch(`${API_URL}/usuarios`);
    if (!response.ok) throw new Error('Error al cargar usuarios');
    return await response.json();
  },

  // Crear nuevo usuario
  create: async (usuarioData) => {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear usuario');
    }
    return await response.json();
  },

  // Actualizar usuario
  update: async (id, usuarioData) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar usuario');
    }
    return await response.json();
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar usuario');
    }
    return await response.json();
  }
};