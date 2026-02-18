const API_URL = 'https://turbo-dollop-g456jw96qpwqfg7x-5000.app.github.dev/api';

// Servicio de Clientes
export const clientesAPI = {
  // Obtener todos los clientes
  getAll: async () => {
    const response = await fetch(`${API_URL}/clientes`);
    if (!response.ok) throw new Error('Error al cargar clientes');
    return await response.json();
  },

  // Crear un cliente
  create: async (clienteData) => {
    const response = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clienteData)
    });
    if (!response.ok) throw new Error('Error al crear cliente');
    return await response.json();
  },

  // Actualizar un cliente
  update: async (id, clienteData) => {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clienteData)
    });
    if (!response.ok) throw new Error('Error al actualizar cliente');
    return await response.json();
  },

  // Eliminar un cliente
  delete: async (id) => {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar cliente');
    return await response.json();
  }
};

export default API_URL;