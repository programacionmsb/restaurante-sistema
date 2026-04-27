const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioAppSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  emailVerificado: { type: Boolean, default: false },
  tokenVerificacion: { type: String },
  tokenExpira: { type: Date },
  activo: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

usuarioAppSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

usuarioAppSchema.methods.compararPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('UsuarioApp', usuarioAppSchema);
