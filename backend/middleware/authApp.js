const jwt = require('jsonwebtoken');
const UsuarioApp = require('../models/UsuarioApp');

const authApp = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_APP_SECRET);

    const usuario = await UsuarioApp.findById(decoded.id).select('-password');
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Cuenta desactivada' });
    }

    if (!usuario.emailVerificado) {
      return res.status(403).json({ error: 'Debes verificar tu email para continuar' });
    }

    req.usuarioApp = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = authApp;
