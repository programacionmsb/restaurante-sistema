const Cliente = require('../models/Cliente');
const { emitirActualizacion } = require('../utils/helpers');

exports.getAll = async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    emitirActualizacion('cliente-creado', cliente);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    emitirActualizacion('cliente-actualizado', cliente);
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    emitirActualizacion('cliente-eliminado', req.params.id);
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
