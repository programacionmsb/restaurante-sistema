const mongoose = require('mongoose');

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
      enum: ['Entrada', 'Plato Principal', 'Postre', 'Bebida', 'Otros']
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

module.exports = mongoose.model('MenuDia', menuDiaSchema);