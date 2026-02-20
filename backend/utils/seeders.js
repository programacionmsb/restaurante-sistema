const Rol = require('../models/Rol');
const Usuario = require('../models/Usuario');
const { PERMISOS_DISPONIBLES } = require('../config/permisos');

const crearRolesPredefinidos = async () => {
  try {
    const count = await Rol.countDocuments();
    
    if (count === 0) {
      console.log('📋 Creando roles predefinidos...');
      
      const rolesPredefinidos = [
        {
          nombre: 'Administrador',
          descripcion: 'Acceso total al sistema',
          permisos: Object.keys(PERMISOS_DISPONIBLES),
          esPredefinido: true,
          color: '#667eea'
        },
        {
          nombre: 'Mesero',
          descripcion: 'Atención al cliente y toma de pedidos',
          permisos: [
            'clientes.ver', 'clientes.crear',
            'pedidos.ver_propios', 'pedidos.crear', 'pedidos.editar',
            'caja.cobrar',
            'creditos.ver_propios', 'creditos.cobrar_propios',  // ← NUEVO
            'platos.ver', 'platos.ver_precios',
            'menu.ver'
          ],
          esPredefinido: true,
          color: '#10b981'
        },
        {
          nombre: 'Cocinero',
          descripcion: 'Preparación de pedidos en cocina',
          permisos: [
            'cocina.ver', 'cocina.actualizar',
            'platos.ver',
            'menu.ver'
          ],
          esPredefinido: true,
          color: '#f59e0b'
        },
        {
          nombre: 'Cajero',
          descripcion: 'Gestión de pagos y reportes de caja',
          permisos: [
            'caja.cobrar', 'caja.ver_reportes', 'caja.ver_totales',
            'pedidos.ver_todos',
            'creditos.ver_todos', 'creditos.cobrar_todos', 'creditos.ver_reportes',  // ← NUEVO
            'reportes.ventas'
          ],
          esPredefinido: true,
          color: '#ef4444'
        },
        // ========== ROL NUEVO: MESERO SENIOR ========== 
        {
          nombre: 'Mesero Senior',
          descripcion: 'Mesero con permisos para autorizar créditos',
          permisos: [
            'clientes.ver', 'clientes.crear',
            'pedidos.ver_propios', 'pedidos.crear', 'pedidos.editar',
            'caja.cobrar',
            'creditos.ver_propios', 'creditos.crear', 'creditos.cobrar_propios',  // ← NUEVO (con crear)
            'platos.ver', 'platos.ver_precios',
            'menu.ver'
          ],
          esPredefinido: true,
          color: '#8b5cf6'
        }
        // ========== FIN ROL NUEVO ========== 
      ];
      
      await Rol.insertMany(rolesPredefinidos);
      console.log('✅ Roles predefinidos creados');
      
      const rolAdmin = await Rol.findOne({ nombre: 'Administrador' });
      const adminExiste = await Usuario.findOne({ usuario: 'admin' });
      
      if (!adminExiste && rolAdmin) {
        await Usuario.create({
          nombre: 'Administrador',
          usuario: 'admin',
          password: 'admin123',
          email: 'admin@restaurante.com',
          rol: rolAdmin._id,
          activo: true
        });
        console.log('✅ Usuario admin creado (usuario: admin, password: admin123)');
      }
    }
  } catch (error) {
    console.error('❌ Error creando roles predefinidos:', error);
  }
};

module.exports = { crearRolesPredefinidos };