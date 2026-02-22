export const filtrarClientes = (clientes, searchTerm) => {
  if (!searchTerm.trim()) return clientes;
  
  const termLower = searchTerm.toLowerCase();
  return clientes.filter(c => 
    c.nombre.toLowerCase().includes(termLower) ||
    c.telefono.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(termLower))
  );
};

export const validarFormularioCliente = (formData) => {
  const errors = {};

  if (!formData.nombre || formData.nombre.trim() === '') {
    errors.nombre = 'El nombre es requerido';
  }

  if (!formData.telefono || formData.telefono.trim() === '') {
    errors.telefono = 'El teléfono es requerido';
  }

  if (formData.email && !validarEmail(formData.email)) {
    errors.email = 'Email inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const obtenerEstadisticasClientes = (clientes) => {
  const totalClientes = clientes.length;
  const clientesConEmail = clientes.filter(c => c.email && c.email.trim() !== '').length;
  const clientesSinEmail = totalClientes - clientesConEmail;

  return {
    totalClientes,
    clientesConEmail,
    clientesSinEmail,
    porcentajeConEmail: totalClientes > 0 ? (clientesConEmail / totalClientes * 100).toFixed(1) : 0
  };
};