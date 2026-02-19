const Usuario = require('../models/Usuario');

exports.login = async (req, res) => {
  try {
    const { usuario, password } = req.body;
    const user = await Usuario.findOne({ usuario, activo: true }).populate('rol');
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    user.ultimoAcceso = new Date();
    await user.save();
    const userSinPassword = {
      _id: user._id,
      nombre: user.nombre,
      usuario: user.usuario,
      email: user.email,
      rol: user.rol,
      ultimoAcceso: user.ultimoAcceso
    };
    res.json(userSinPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
