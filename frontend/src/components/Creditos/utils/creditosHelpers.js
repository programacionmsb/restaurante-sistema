export const formatearMoneda = (monto) => {
  return `S/ ${monto.toFixed(2)}`;
};

export const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const filtrarClientes = (clientes, busqueda) => {
  if (!Array.isArray(clientes)) return [];
  
  if (!busqueda.trim()) return clientes;
  
  const termLower = busqueda.toLowerCase();
  return clientes.filter(c => 
    (c.nombre && c.nombre.toLowerCase().includes(termLower)) ||
    (c.telefono && c.telefono.includes(busqueda))
  );
};

export const calcularTotalDeuda = (clientes) => {
  if (!Array.isArray(clientes)) return 0;
  return clientes.reduce((sum, c) => sum + (c.totalDeuda || 0), 0);
};