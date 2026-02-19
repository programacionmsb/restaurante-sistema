const mongoose = require('mongoose');

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

module.exports = mongoose.model('Usuario', usuarioSchema);
