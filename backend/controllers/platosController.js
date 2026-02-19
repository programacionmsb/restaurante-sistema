const Plato = require('../models/Plato');
const { emitirActualizacion } = require('../utils/helpers');

exports.getByTipo = async (req, res) => {
  try {
    const platos = await Plato.find({ tipo: req.params.tipo }).sort({ createdAt: -1 });
    res.json(platos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const plato = new Plato(req.body);
    await plato.save();
    emitirActualizacion('plato-creado', plato);
    res.status(201).json(plato);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const plato = await Plato.findByIdAndUpdate(req.params.id, req.body, { new: true });
    emitirActualizacion('plato-actualizado', plato);
    res.json(plato);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const plato = await Plato.findByIdAndDelete(req.params.id);
    emitirActualizacion('plato-eliminado', { id: req.params.id, tipo: plato.tipo });
    res.json({ mensaje: 'Plato eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
