const Usuario = require('../models/Usuario');
const { emitirActualizacion } = require('../utils/helpers');

exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select('-password')
      .populate('rol')
      .sort({ nombre: 1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
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
};

exports.update = async (req, res) => {
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
};

exports.delete = async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    emitirActualizacion('usuario-eliminado', req.params.id);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
