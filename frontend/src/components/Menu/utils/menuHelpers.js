// ========== FECHAS ==========

export const getInicioSemana = (fecha) => {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const getFinSemana = (inicioSemana) => {
  const fin = new Date(inicioSemana);
  fin.setDate(fin.getDate() + 6);
  return fin;
};

export const getDiasSemanales = (semanaActual) => {
  const dias = [];
  const inicio = new Date(semanaActual);
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(inicio);
    fecha.setDate(fecha.getDate() + i);
    dias.push(fecha);
  }
  return dias;
};

// Compara fechas usando partes UTC para evitar problemas de zona horaria
export const getMenusPorFecha = (menus, fecha) => {
  const fechaStr = fecha.toISOString().split('T')[0];
  return menus.filter(m => {
    const d = new Date(m.fecha);
    // Usar partes UTC directamente para evitar desfase por zona horaria
    const menuFecha = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    return menuFecha === fechaStr;
  });
};

export const formatFecha = (fecha) => {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${dias[fecha.getDay()]} ${fecha.getDate()} ${meses[fecha.getMonth()]}`;
};

export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ========== CATEGORÍAS ==========

export const CATEGORIA_LABELS = {
  'Entrada': '🥗 Entradas',
  'Plato Principal': '🍖 Platos Principales',
  'Bebida': '🥤 Bebidas',
  'Postre': '🍰 Postres',
  'Otros': '📦 Otros',
};

export const CATEGORIA_LABELS_PDF = {
  'Entrada': '🥗 ENTRADA',
  'Plato Principal': '🍖 PLATO PRINCIPAL',
  'Bebida': '🥤 BEBIDA',
  'Postre': '🍰 POSTRE',
  'Otros': '📦 OTROS',
};

export const TIPO_POR_CATEGORIA = {
  'Entrada': 'entrada',
  'Plato Principal': 'plato',
  'Bebida': 'bebida',
  'Postre': 'postre',
  'Otros': 'otros',
};

export const CATEGORIAS_DISPONIBLES = ['Entrada', 'Plato Principal', 'Bebida', 'Postre', 'Otros'];

export const getCategoriaLabel = (nombre) => CATEGORIA_LABELS[nombre] || nombre;

export const getTipoPorCategoria = (nombreCategoria) => TIPO_POR_CATEGORIA[nombreCategoria] || 'plato';

// ========== PLATOS ==========

export const getPlatoInfo = (platosDisponibles, platoId) => {
  for (const platos of Object.values(platosDisponibles)) {
    const plato = platos.find(p => p._id === platoId);
    if (plato) return plato;
  }
  return null;
};