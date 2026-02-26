export const CATEGORIAS = ['entrada', 'plato', 'bebida', 'postre', 'otros'];

export const getCategoriaLabel = (tipo) => {
  const labels = {
    'entrada': '🥗 Entradas',
    'plato': '🍖 Platos Principales',
    'bebida': '🥤 Bebidas',
    'postre': '🍰 Postres',
    'menu': '📋 Menú',
    'otros': '📦 Otros',
  };
  return labels[tipo] || tipo;
};

export const getCategoriaColor = (tipo) => {
  const colors = {
    'entrada': '#10b981',
    'plato': '#f59e0b',
    'bebida': '#3b82f6',
    'postre': '#a855f7',
    'menu': '#ec4899',
    'otros': '#6b7280',
  };
  return colors[tipo] || '#6b7280';
};