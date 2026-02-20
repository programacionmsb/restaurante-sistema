const mongoose = require('mongoose');

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
    enum: ['pendiente', 'pagado', 'credito', 'pagado_parcial'],  // ← MODIFICADO
    default: 'pendiente'
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'yape', 'transferencia'],
    default: null
  },
  // ========== NUEVOS CAMPOS PARA CRÉDITOS ========== 
  montoPagado: {
    type: Number,
    default: 0
  },
  montoRestante: {
    type: Number,
    default: 0
  },
  credito: {
    clienteNombre: String,
    clienteTelefono: String,
    notas: String,
    fechaCredito: Date,
    autorizadoPor: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      nombre: String,
      usuario: String
    }
  },
  pagos: [{
    monto: { type: Number, required: true },
    metodoPago: { 
      type: String, 
      enum: ['efectivo', 'yape', 'transferencia'],
      required: true 
    },
    fecha: { type: Date, default: Date.now },
    cobradoPor: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      nombre: String,
      usuario: String,
      rol: String
    }
  }],
  // ========== FIN NUEVOS CAMPOS ========== 
  total: { type: Number, required: true },
  totalDescuentos: { type: Number, default: 0 },
  hora: String,
  inicioPreparacion: { type: Date },
  finPreparacion: { type: Date },
  cancelado: { type: Boolean, default: false },
  motivoCancelacion: { type: String },
  fechaCancelacion: { type: Date },
  usuarioCancelacion: { type: String },
  usuarioCreador: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    nombre: String,
    usuario: String
  },
  createdAt: { type: Date, default: Date.now }
});

// ========== MIDDLEWARE PARA CALCULAR MONTOS ========== 
pedidoSchema.pre('save', function(next) {
  if (this.isModified('total') || this.isModified('montoPagado')) {
    this.montoRestante = this.total - this.montoPagado;
  }
  next();
});

// ========== ÍNDICES PARA BÚSQUEDAS RÁPIDAS ========== 
pedidoSchema.index({ 'usuarioCreador._id': 1, estadoPago: 1 });
pedidoSchema.index({ estadoPago: 1, createdAt: -1 });
pedidoSchema.index({ 'credito.clienteNombre': 1, estadoPago: 1 });

module.exports = mongoose.model('Pedido', pedidoSchema);