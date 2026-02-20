const PERMISOS_DISPONIBLES = {
  // CLIENTES
  'clientes.ver': 'Ver listado de clientes',
  'clientes.crear': 'Crear nuevos clientes',
  'clientes.editar': 'Editar clientes existentes',
  'clientes.eliminar': 'Eliminar clientes',
  
  // PEDIDOS
  'pedidos.ver_todos': 'Ver todos los pedidos',
  'pedidos.ver_propios': 'Ver solo pedidos propios',
  'pedidos.crear': 'Crear nuevos pedidos',
  'pedidos.editar': 'Editar pedidos pendientes',
  'pedidos.cancelar': 'Cancelar pedidos',
  
  // COCINA
  'cocina.ver': 'Ver pedidos en cocina',
  'cocina.actualizar': 'Marcar pedidos como completados',
  
  // CAJA
  'caja.cobrar': 'Registrar pagos',
  'caja.ver_reportes': 'Ver reportes de caja',
  'caja.ver_totales': 'Ver totales del día',
  'caja.exportar': 'Exportar reportes',
  
  // ========== CRÉDITOS (NUEVO) ========== 
  'creditos.ver_propios': 'Ver solo créditos propios',
  'creditos.ver_todos': 'Ver todos los créditos del restaurante',
  'creditos.crear': 'Autorizar créditos/fiados',
  'creditos.cobrar_propios': 'Cobrar solo créditos propios',
  'creditos.cobrar_todos': 'Cobrar cualquier crédito',
  'creditos.ver_reportes': 'Ver reportes de créditos',
  // ========== FIN CRÉDITOS ========== 
  
  // PLATOS
  'platos.ver': 'Ver catálogo de platos',
  'platos.crear': 'Crear nuevos platos',
  'platos.editar': 'Editar platos existentes',
  'platos.eliminar': 'Eliminar platos',
  'platos.ver_precios': 'Ver precios de platos',
  'platos.editar_precios': 'Modificar precios',
  
  // MENÚ DEL DÍA
  'menu.ver': 'Ver menú del día',
  'menu.crear': 'Crear menú del día',
  'menu.editar': 'Editar menú del día',
  'menu.eliminar': 'Eliminar menú del día',
  
  // USUARIOS
  'usuarios.ver': 'Ver lista de usuarios',
  'usuarios.crear': 'Crear nuevos usuarios',
  'usuarios.editar': 'Editar usuarios',
  'usuarios.eliminar': 'Eliminar usuarios',
  
  // ROLES
  'roles.ver': 'Ver roles del sistema',
  'roles.crear': 'Crear roles personalizados',
  'roles.editar': 'Editar roles existentes',
  'roles.eliminar': 'Eliminar roles',
  
  // REPORTES
  'reportes.ventas': 'Ver reportes de ventas',
  'reportes.productos': 'Ver reportes de productos',
  'reportes.empleados': 'Ver reportes por empleado',
  
  // CONFIGURACIÓN
  'config.general': 'Acceder a configuración general',
  'config.empresa': 'Modificar datos de la empresa'
};

module.exports = { PERMISOS_DISPONIBLES };