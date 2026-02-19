const mongoose = require('mongoose');
const { PERMISOS_DISPONIBLES } = require('../config/permisos');

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

module.exports = mongoose.model('Rol', rolSchema);
