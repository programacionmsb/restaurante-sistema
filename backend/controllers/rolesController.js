const Rol = require('../models/Rol');
const Usuario = require('../models/Usuario');
const { PERMISOS_DISPONIBLES } = require('../config/permisos');
const { emitirActualizacion } = require('../utils/helpers');

exports.getPermisosDisponibles = (req, res) => {
  res.json(PERMISOS_DISPONIBLES);
};

exports.getAll = async (req, res) => {
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
};

exports.getById = async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const rol = new Rol(req.body);
    await rol.save();
    emitirActualizacion('rol-creado', rol);
    res.status(201).json(rol);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
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
};

exports.delete = async (req, res) => {
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
};
