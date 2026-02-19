const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// Configurar CORS
app.use(cors({
  origin: [
    'https://restaurante-frontend-017o.onrender.com',  // ← URL CORRECTA
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Conexión a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

// ============================================================================
// CATÁLOGO DE PERMISOS
// ============================================================================
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

// ============================================================================
// SCHEMAS Y MODELOS
// ============================================================================

// Schema de Cliente
const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  email: String,
  createdAt: { type: Date, default: Date.now }
});

// Schema de Plato
const platoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  tipo: { type: String, enum: ['entrada', 'plato', 'bebida', 'postre', 'menu', 'otros'], required: true },
  disponible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// ============================================================================
// SCHEMA DE PEDIDO ACTUALIZADO
// ============================================================================

// Schema de Pedido
const pedidoSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  mesa: { type: String, required: true },
  items: [{
    tipo: String,
    nombre: String,
    cantidad: Number,
    precio: Number,
    descuento: { 
      type: Number, 
      default: 0 
    },
    tipoDescuento: { 
      type: String, 
      enum: ['porcentaje', 'monto'], 
      default: 'porcentaje' 
    },
    motivoDescuento: { 
      type: String,
      default: ''
    },
    usuarioDescuento: {
      type: String,
      default: ''
    },
    observaciones: {
      type: String,
      default: ''
    }
  }],
  estado: { 
    type: String, 
    enum: ['pendiente', 'en_preparacion', 'completado', 'cancelado'],
    default: 'pendiente'
  },
  estadoPago: {
    type: String,
    enum: ['pendiente', 'pagado'],
    default: 'pendiente'
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'yape', 'transferencia'],
    default: null
  },
  total: { type: Number, required: true },
  totalDescuentos: { type: Number, default: 0 },
  hora: String,
  inicioPreparacion: { type: Date },
  finPreparacion: { type: Date },
  cancelado: { type: Boolean, default: false },
  motivoCancelacion: { type: String },
  fechaCancelacion: { type: Date },
  usuarioCancelacion: { type: String },
  // NUEVO CAMPO: Usuario que creó el pedido
  usuarioCreador: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    nombre: String,
    usuario: String
  },
  createdAt: { type: Date, default: Date.now }
});

// ============================================================================
// AGREGAR ESTE SCHEMA ANTES DE usuarioSchema (línea ~185 en tu server.js)
// ============================================================================

// Schema de Rol
const rolSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  descripcion: { 
    type: String,
    default: ''
  },
  permisos: [{ 
    type: String,
    validate: {
      validator: function(v) {
        return Object.keys(PERMISOS_DISPONIBLES).includes(v);
      },
      message: props => `${props.value} no es un permiso válido`
    }
  }],
  esPredefinido: { 
    type: Boolean, 
    default: false 
  },
  color: { 
    type: String, 
    default: '#667eea' 
  },
  activo: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Schema de Usuario
const usuarioSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true,
    trim: true
  },
  usuario: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  rol: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Rol',
    required: true 
  },
  pin: {
    type: String,
    length: 4
  },
  activo: { 
    type: Boolean, 
    default: true 
  },
  ultimoAcceso: Date,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Schema de Menú del Día
const menuDiaSchema = new mongoose.Schema({
  fecha: { 
    type: Date, 
    required: true
  },
  nombre: { 
    type: String, 
    required: true 
  },
  descripcion: {
    type: String,
    default: ''
  },
  categorias: [{
    nombre: { 
      type: String, 
      required: true,
      enum: ['Entrada', 'Plato Principal', 'Postre', 'Bebida']
    },
    platos: [{
      platoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Plato',
        required: true
      },
      nombre: String,
      precio: Number,
      disponible: { 
        type: Boolean, 
        default: true 
      }
    }]
  }],
  precioCompleto: {
    type: Number,
    default: 0
  },
  activo: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// MODELOS
const Cliente = mongoose.model('Cliente', clienteSchema);
const Plato = mongoose.model('Plato', platoSchema);
const Pedido = mongoose.model('Pedido', pedidoSchema);
const Rol = mongoose.model('Rol', rolSchema);
const Usuario = mongoose.model('Usuario', usuarioSchema);
const MenuDia = mongoose.model('MenuDia', menuDiaSchema);

// ============================================================================
// FUNCIÓN PARA CREAR ROLES PREDEFINIDOS
// ============================================================================
async function crearRolesPredefinidos() {
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
            'reportes.ventas'
          ],
          esPredefinido: true,
          color: '#ef4444'
        }
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
}

// Conectar a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas');
    crearRolesPredefinidos();
  })
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// ============================================================================
// Socket.IO
// ============================================================================
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

function emitirActualizacion(evento, datos) {
  io.emit(evento, datos);
}

// ============================================================================
// RUTAS - CLIENTES
// ============================================================================
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    emitirActualizacion('cliente-creado', cliente);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    emitirActualizacion('cliente-actualizado', cliente);
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    emitirActualizacion('cliente-eliminado', req.params.id);
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// RUTAS - PLATOS
// ============================================================================
app.get('/api/platos/:tipo', async (req, res) => {
  try {
    const platos = await Plato.find({ tipo: req.params.tipo }).sort({ createdAt: -1 });
    res.json(platos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/platos', async (req, res) => {
  try {
    const plato = new Plato(req.body);
    await plato.save();
    emitirActualizacion('plato-creado', plato);
    res.status(201).json(plato);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/platos/:id', async (req, res) => {
  try {
    const plato = await Plato.findByIdAndUpdate(req.params.id, req.body, { new: true });
    emitirActualizacion('plato-actualizado', plato);
    res.json(plato);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/platos/:id', async (req, res) => {
  try {
    const plato = await Plato.findByIdAndDelete(req.params.id);
    emitirActualizacion('plato-eliminado', { id: req.params.id, tipo: plato.tipo });
    res.json({ mensaje: 'Plato eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// RUTAS DE PEDIDOS CORREGIDAS - MESERO PUEDE COBRAR PERO SOLO VE SUS PEDIDOS
// ============================================================================

app.get('/api/pedidos/hoy', async (req, res) => {
  try {
    const { usuarioId } = req.query;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    let filtro = { createdAt: { $gte: hoy } };
    
    // Si se proporciona usuarioId, verificar permisos
    if (usuarioId) {
      const usuario = await Usuario.findById(usuarioId).populate('rol');
      
      if (usuario) {
        const permisos = usuario.rol.permisos || [];
        
        // CORREGIDO: Solo estos permisos permiten ver TODOS los pedidos
        const puedeVerTodos = permisos.includes('pedidos.ver_todos') || 
                              permisos.includes('cocina.ver') || 
                              permisos.includes('caja.ver_reportes');
        
        // Si NO puede ver todos, filtrar solo sus pedidos
        // (El mesero puede tener caja.cobrar pero solo ve sus propios pedidos)
        if (!puedeVerTodos) {
          filtro['usuarioCreador._id'] = new mongoose.Types.ObjectId(usuarioId);
        }
      }
    }
    
    const pedidos = await Pedido.find(filtro).sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pedidos/rango', async (req, res) => {
  try {
    const { fechaInicio, fechaFin, usuarioId } = req.query;
    
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Debe proporcionar fechaInicio y fechaFin' });
    }

    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    let filtro = { 
      createdAt: { 
        $gte: inicio,
        $lte: fin
      } 
    };
    
    // Si se proporciona usuarioId, verificar permisos
    if (usuarioId) {
      const usuario = await Usuario.findById(usuarioId).populate('rol');
      
      if (usuario) {
        const permisos = usuario.rol.permisos || [];
        
        // CORREGIDO: Solo estos permisos permiten ver TODOS los pedidos
        const puedeVerTodos = permisos.includes('pedidos.ver_todos') || 
                              permisos.includes('cocina.ver') || 
                              permisos.includes('caja.ver_reportes');
        
        // Si NO puede ver todos, filtrar solo sus pedidos
        if (!puedeVerTodos) {
          filtro['usuarioCreador._id'] = new mongoose.Types.ObjectId(usuarioId);
        }
      }
    }
    
    const pedidos = await Pedido.find(filtro).sort({ createdAt: -1 });
    
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pedidos', async (req, res) => {
  try {
    const pedido = new Pedido(req.body);
    await pedido.save();
    emitirActualizacion('pedido-creado', pedido);
    res.status(201).json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/pedidos/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    emitirActualizacion('pedido-actualizado', pedido);
    res.json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/pedidos/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    pedido.estado = estado;
    
    if (estado === 'en_preparacion' && !pedido.inicioPreparacion) {
      pedido.inicioPreparacion = new Date();
    }
    
    if (estado === 'completado' && !pedido.finPreparacion) {
      pedido.finPreparacion = new Date();
    }
    
    await pedido.save();
    emitirActualizacion('pedido-actualizado', pedido);
    res.json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/pedidos/:id/pago', async (req, res) => {
  try {
    const { metodoPago } = req.body;
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    pedido.estadoPago = 'pagado';
    pedido.metodoPago = metodoPago;
    
    await pedido.save();
    emitirActualizacion('pedido-pagado', pedido);
    res.json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/pedidos/:id/cancelar', async (req, res) => {
  try {
    const { motivo, usuario } = req.body;
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    pedido.cancelado = true;
    pedido.motivoCancelacion = motivo;
    pedido.usuarioCancelacion = usuario;
    pedido.fechaCancelacion = new Date();
    pedido.estado = 'cancelado';
    
    await pedido.save();
    emitirActualizacion('pedido-cancelado', pedido);
    res.json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// RUTAS - ROLES
// ============================================================================
app.get('/api/roles/permisos-disponibles', (req, res) => {
  res.json(PERMISOS_DISPONIBLES);
});

app.get('/api/roles', async (req, res) => {
  try {
    const roles = await Rol.find().sort({ esPredefinido: -1, nombre: 1 });
    const rolesConConteo = await Promise.all(roles.map(async (rol) => {
      const cantidadUsuarios = await Usuario.countDocuments({ rol: rol._id });
      return {
        ...rol.toObject(),
        cantidadUsuarios
      };
    }));
    res.json(rolesConConteo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/roles/:id', async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/roles', async (req, res) => {
  try {
    const rol = new Rol(req.body);
    await rol.save();
    emitirActualizacion('rol-creado', rol);
    res.status(201).json(rol);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/roles/:id', async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    if (rol.esPredefinido && req.body.nombre && req.body.nombre !== rol.nombre) {
      return res.status(403).json({ error: 'No se puede renombrar roles predefinidos' });
    }
    if (rol.esPredefinido && req.body.esPredefinido === false) {
      return res.status(403).json({ error: 'No se puede modificar la protección de roles predefinidos' });
    }
    const rolActualizado = await Rol.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    emitirActualizacion('rol-actualizado', rolActualizado);
    res.json(rolActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/roles/:id', async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    if (rol.esPredefinido) {
      return res.status(403).json({ error: 'No se pueden eliminar roles predefinidos' });
    }
    const usuariosConRol = await Usuario.countDocuments({ rol: req.params.id });
    if (usuariosConRol > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar. Hay ${usuariosConRol} usuario(s) con este rol.`
      });
    }
    await Rol.findByIdAndDelete(req.params.id);
    emitirActualizacion('rol-eliminado', req.params.id);
    res.json({ mensaje: 'Rol eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// RUTAS - USUARIOS
// ============================================================================
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select('-password')
      .populate('rol')
      .sort({ nombre: 1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    const usuarioSinPassword = await Usuario.findById(usuario._id)
      .select('-password')
      .populate('rol');
    emitirActualizacion('usuario-creado', usuarioSinPassword);
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/usuarios/:id', async (req, res) => {
  try {
    if (!req.body.password) {
      delete req.body.password;
    }
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password').populate('rol');
    emitirActualizacion('usuario-actualizado', usuario);
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    emitirActualizacion('usuario-eliminado', req.params.id);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// RUTAS - AUTENTICACIÓN
// ============================================================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;
    const user = await Usuario.findOne({ usuario, activo: true }).populate('rol');
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    user.ultimoAcceso = new Date();
    await user.save();
    const userSinPassword = {
      _id: user._id,
      nombre: user.nombre,
      usuario: user.usuario,
      email: user.email,
      rol: user.rol,
      ultimoAcceso: user.ultimoAcceso
    };
    res.json(userSinPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// RUTAS - MENÚ DEL DÍA
// ============================================================================

// Obtener todos los menús del día actual
app.get('/api/menu-dia/hoy', async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const menus = await MenuDia.find({
      fecha: { $gte: hoy, $lt: manana },
      activo: true
    }).populate('categorias.platos.platoId').sort({ nombre: 1 });
    
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los menús por fecha específica
app.get('/api/menu-dia/fecha/:fecha', async (req, res) => {
  try {
    const fecha = new Date(req.params.fecha);
    fecha.setHours(0, 0, 0, 0);
    
    const siguiente = new Date(fecha);
    siguiente.setDate(siguiente.getDate() + 1);
    
    const menus = await MenuDia.find({
      fecha: { $gte: fecha, $lt: siguiente }
    }).populate('categorias.platos.platoId').sort({ nombre: 1 });
    
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un menú específico por ID
app.get('/api/menu-dia/:id', async (req, res) => {
  try {
    const menu = await MenuDia.findById(req.params.id).populate('categorias.platos.platoId');
    
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los menús (con paginación y filtro por rango)
app.get('/api/menu-dia', async (req, res) => {
  try {
    const { limit = 30, activo, fechaInicio, fechaFin } = req.query;
    
    const filtro = {};
    
    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }
    
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      
      filtro.fecha = { $gte: inicio, $lte: fin };
    }
    
    const menus = await MenuDia.find(filtro)
      .sort({ fecha: 1, nombre: 1 })
      .limit(parseInt(limit))
      .populate('categorias.platos.platoId');
    
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo menú
app.post('/api/menu-dia', async (req, res) => {
  try {
    const { fecha, nombre, descripcion, categorias, precioCompleto } = req.body;
    
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre del menú es obligatorio' });
    }
    
    // NORMALIZAR FECHA: Solo día, sin hora
    const fechaStr = fecha.split('T')[0]; // "2026-02-17"
    const fechaDate = new Date(fechaStr + 'T00:00:00.000Z'); // Forzar UTC medianoche
    
    console.log('📅 Fecha recibida:', fecha);
    console.log('📅 Fecha normalizada:', fechaDate);
    console.log('📝 Nombre del menú:', nombre.trim());
    
    // Verificar duplicado: mismo DÍA + mismo NOMBRE
    const menuExistente = await MenuDia.findOne({
      fecha: fechaDate,
      nombre: nombre.trim()
    });
    
    if (menuExistente) {
      console.log('❌ Menú duplicado encontrado:', menuExistente);
      return res.status(400).json({ 
        error: 'Ya existe un menú con este nombre para esta fecha' 
      });
    }
    
    console.log('✅ No hay duplicados, creando menú...');
    
    // Procesar categorías
    const categoriasCompletas = await Promise.all(
      categorias.map(async (cat) => {
        const platosCompletos = await Promise.all(
          cat.platos.map(async (p) => {
            const plato = await Plato.findById(p.platoId);
            if (!plato) {
              throw new Error(`Plato con ID ${p.platoId} no encontrado`);
            }
            return {
              platoId: p.platoId,
              nombre: plato.nombre,
              precio: p.precio !== undefined ? p.precio : plato.precio,
              disponible: p.disponible !== undefined ? p.disponible : true
            };
          })
        );
        
        return {
          nombre: cat.nombre,
          platos: platosCompletos
        };
      })
    );
    
    // Crear nuevo menú
    const nuevoMenu = new MenuDia({
      fecha: fechaDate,
      nombre: nombre.trim(),
      descripcion: descripcion || '',
      categorias: categoriasCompletas,
      precioCompleto: precioCompleto || 0,
      activo: true
    });
    
    await nuevoMenu.save();
    console.log('✅ Menú creado exitosamente:', nuevoMenu._id);
    emitirActualizacion('menu-creado', nuevoMenu);
    res.status(201).json(nuevoMenu);
  } catch (error) {
    console.error('❌ Error creando menú:', error);
    res.status(400).json({ error: error.message });
  }
});

// Actualizar menú existente
app.put('/api/menu-dia/:id', async (req, res) => {
  try {
    const { nombre, descripcion, categorias, precioCompleto, activo } = req.body;
    
    const menu = await MenuDia.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    
    // Si se cambia el nombre, verificar que no exista otro con ese nombre en la misma fecha
    if (nombre && nombre.trim() !== menu.nombre) {
      const fechaMenu = new Date(menu.fecha);
      fechaMenu.setUTCHours(0, 0, 0, 0);  // ← CAMBIO: normalizar fecha
      
      const menuConMismoNombre = await MenuDia.findOne({
        _id: { $ne: req.params.id },
        fecha: fechaMenu,  // ← CAMBIO: comparación exacta
        nombre: nombre.trim()
      });
      
      if (menuConMismoNombre) {
        return res.status(400).json({ 
          error: 'Ya existe un menú con este nombre para esta fecha' 
        });
      }
    }
    
    if (categorias) {
      const categoriasCompletas = await Promise.all(
        categorias.map(async (cat) => {
          const platosCompletos = await Promise.all(
            cat.platos.map(async (p) => {
              const plato = await Plato.findById(p.platoId);
              if (!plato) {
                throw new Error(`Plato con ID ${p.platoId} no encontrado`);
              }
              return {
                platoId: p.platoId,
                nombre: plato.nombre,
                precio: p.precio !== undefined ? p.precio : plato.precio,
                disponible: p.disponible !== undefined ? p.disponible : true
              };
            })
          );
          
          return {
            nombre: cat.nombre,
            platos: platosCompletos
          };
        })
      );
      menu.categorias = categoriasCompletas;
    }
    
    if (nombre) menu.nombre = nombre.trim();
    if (descripcion !== undefined) menu.descripcion = descripcion;
    if (precioCompleto !== undefined) menu.precioCompleto = precioCompleto;
    if (activo !== undefined) menu.activo = activo;
    
    await menu.save();
    emitirActualizacion('menu-actualizado', menu);
    res.json(menu);
  } catch (error) {
    // Manejar error de índice único
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Ya existe un menú con este nombre para esta fecha' 
      });
    }
    res.status(400).json({ error: error.message });
  }
});

// Eliminar menú
app.delete('/api/menu-dia/:id', async (req, res) => {
  try {
    const menu = await MenuDia.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    emitirActualizacion('menu-eliminado', req.params.id);
    res.json({ message: 'Menú eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activar/Desactivar menú
app.patch('/api/menu-dia/:id/toggle', async (req, res) => {
  try {
    const menu = await MenuDia.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    
    menu.activo = !menu.activo;
    await menu.save();
    
    emitirActualizacion('menu-actualizado', menu);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar disponibilidad de un plato en el menú
app.patch('/api/menu-dia/:menuId/plato/:platoId/disponibilidad', async (req, res) => {
  try {
    const { menuId, platoId } = req.params;
    const { disponible } = req.body;
    
    const menu = await MenuDia.findById(menuId);
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    
    let platoEncontrado = false;
    menu.categorias.forEach(cat => {
      const plato = cat.platos.find(p => p.platoId.toString() === platoId);
      if (plato) {
        plato.disponible = disponible;
        platoEncontrado = true;
      }
    });
    
    if (!platoEncontrado) {
      return res.status(404).json({ error: 'Plato no encontrado en este menú' });
    }
    
    await menu.save();
    emitirActualizacion('menu-actualizado', menu);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// RUTA PRINCIPAL
// ============================================================================
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Sistema de Restaurante funcionando' });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});