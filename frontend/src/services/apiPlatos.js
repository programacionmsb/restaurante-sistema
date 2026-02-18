const API_URL = 'https://restaurante-backend-a6o9.onrender.com/api'

// Servicio de Platos
export const platosAPI = {
  // Obtener platos por tipo
  getByTipo: async (tipo) => {
    const response = await fetch(`${API_URL}/platos/${tipo}`);
    if (!response.ok) throw new Error('Error al cargar platos');
    return await response.json();
  },

  // Crear plato
  create: async (platoData) => {
    const response = await fetch(`${API_URL}/platos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(platoData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear plato');
    }
    return await response.json();
  },

  // Actualizar plato
  update: async (id, platoData) => {
    const response = await fetch(`${API_URL}/platos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(platoData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar plato');
    }
    return await response.json();
  },

  // Eliminar plato
  delete: async (id) => {
    const response = await fetch(`${API_URL}/platos/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar plato');
    }
    return await response.json();
  }
};