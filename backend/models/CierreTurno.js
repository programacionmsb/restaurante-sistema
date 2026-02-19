const mongoose = require('mongoose');

const cierreTurnoSchema = new mongoose.Schema({
  usuario: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    nombre: { type: String, required: true },
    usuario: { type: String, required: true }
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  turno: {
    inicio: { type: Date, required: true },
    fin: { type: Date, required: true }
  },
  resumen: {
    totalPedidos: { type: Number, default: 0 },
    totalVentas: { type: Number, default: 0 },
    efectivo: { type: Number, default: 0 },
    yape: { type: Number, default: 0 },
    transferencia: { type: Number, default: 0 }
  },
  pedidos: [{
    pedidoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' },
    cliente: String,
    mesa: String,
    total: Number,
    metodoPago: String,
    hora: String
  }],
  entregado: {
    type: Boolean,
    default: false
  },
  montoEntregado: {
    type: Number,
    default: 0
  },
  diferencia: {
    type: Number,
    default: 0
  },
  supervisorRecibe: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    nombre: String,
    usuario: String
  },
  fechaEntrega: Date,
  observaciones: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice para búsquedas rápidas
cierreTurnoSchema.index({ 'usuario._id': 1, fecha: -1 });
cierreTurnoSchema.index({ fecha: -1 });

module.exports = mongoose.model('CierreTurno', cierreTurnoSchema);
