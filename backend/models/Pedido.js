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
  usuarioCreador: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    nombre: String,
    usuario: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pedido', pedidoSchema);
