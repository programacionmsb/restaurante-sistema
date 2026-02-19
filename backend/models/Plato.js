const mongoose = require('mongoose');

const platoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  tipo: { 
    type: String, 
    enum: ['entrada', 'plato', 'bebida', 'postre', 'menu', 'otros'], 
    required: true 
  },
  disponible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plato', platoSchema);
