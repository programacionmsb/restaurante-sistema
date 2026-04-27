const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const UsuarioApp = require('../models/UsuarioApp');
const Pedido = require('../models/Pedido');
const MenuDia = require('../models/MenuDia');
const { enviarVerificacion, enviarBienvenida } = require('../utils/emailService');

const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const existente = await UsuarioApp.findOne({ email: email.toLowerCase().trim() });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const tokenVerificacion = crypto.randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const usuario = new UsuarioApp({
      nombre,
      email,
      password,
      tokenVerificacion,
      tokenExpira
    });
    await usuario.save();

    await enviarVerificacion(email, nombre, tokenVerificacion);

    res.status(201).json({
      mensaje: 'Cuenta creada exitosamente. Revisa tu email para verificar tu cuenta.'
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const verificarEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const usuario = await UsuarioApp.findOne({
      tokenVerificacion: token,
      tokenExpira: { $gt: new Date() }
    });

    if (!usuario) {
      return res.status(400).send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enlace inválido - La Sabro-Zona</title>
</head>
<body style="margin:0;padding:0;background-color:#1a1a1a;font-family:'Segoe UI',Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;padding:40px;max-width:500px;">
    <div style="font-size:64px;margin-bottom:16px;">❌</div>
    <h1 style="color:#FF6B2C;margin:0 0 16px;">Enlace inválido o expirado</h1>
    <p style="color:#cccccc;font-size:16px;line-height:1.6;">Este enlace de verificación no es válido o ha expirado. Solicita un nuevo enlace desde la app.</p>
  </div>
</body>
</html>`);
    }

    usuario.emailVerificado = true;
    usuario.tokenVerificacion = undefined;
    usuario.tokenExpira = undefined;
    await usuario.save();

    await enviarBienvenida(usuario.email, usuario.nombre);

    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verificado - La Sabro-Zona</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #1a1a1a;
      font-family: 'Segoe UI', Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      background-color: #222222;
      border-radius: 20px;
      overflow: hidden;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .header {
      background: linear-gradient(135deg, #FF6B2C, #e8511a);
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .header p {
      color: #ffe0d0;
      font-size: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .body {
      padding: 48px 40px;
      text-align: center;
    }
    .icon { font-size: 72px; margin-bottom: 20px; }
    h2 { color: #FF6B2C; font-size: 26px; margin-bottom: 16px; }
    .desc { color: #cccccc; font-size: 16px; line-height: 1.7; margin-bottom: 12px; }
    .name { color: #ffffff; font-weight: 700; }
    .footer {
      background-color: #1a1a1a;
      padding: 20px 40px;
      text-align: center;
      border-top: 1px solid #333333;
    }
    .footer p { color: #555555; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🍽️ La Sabro-Zona</h1>
      <p>Restaurante</p>
    </div>
    <div class="body">
      <div class="icon">✅</div>
      <h2>¡Email verificado exitosamente!</h2>
      <p class="desc">
        Hola <span class="name">${usuario.nombre}</span>, tu cuenta ha sido verificada correctamente.
      </p>
      <p class="desc">
        Ya puedes iniciar sesión en <strong style="color:#FF6B2C;">La Sabro-Zona</strong> y realizar tus pedidos.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 La Sabro-Zona. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`);
  } catch (error) {
    console.error('Error en verificarEmail:', error);
    res.status(500).send('<h1>Error interno del servidor</h1>');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const usuario = await UsuarioApp.findOne({ email: email.toLowerCase().trim() });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (!usuario.emailVerificado) {
      return res.status(403).json({ error: 'Debes verificar tu email primero' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Cuenta desactivada' });
    }

    const token = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre, email: usuario.email },
      process.env.JWT_APP_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const reenviarVerificacion = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const usuario = await UsuarioApp.findOne({
      email: email.toLowerCase().trim(),
      emailVerificado: false
    });

    if (!usuario) {
      return res.status(404).json({ error: 'No se encontró una cuenta pendiente de verificación con ese email' });
    }

    const tokenVerificacion = crypto.randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000);

    usuario.tokenVerificacion = tokenVerificacion;
    usuario.tokenExpira = tokenExpira;
    await usuario.save();

    await enviarVerificacion(usuario.email, usuario.nombre, tokenVerificacion);

    res.json({ mensaje: 'Email de verificación reenviado exitosamente' });
  } catch (error) {
    console.error('Error en reenviarVerificacion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMenuHoy = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
    const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

    let menu = await MenuDia.findOne({
      fecha: { $gte: inicioDia, $lte: finDia },
      activo: true
    });

    if (!menu) {
      menu = await MenuDia.findOne({ activo: true }).sort({ createdAt: -1 });
    }

    if (!menu) {
      return res.status(404).json({ error: 'No hay menú disponible en este momento' });
    }

    const items = [];
    for (const categoria of menu.categorias) {
      for (const plato of categoria.platos) {
        items.push({
          nombre: plato.nombre,
          precio: plato.precio,
          categoria: categoria.nombre,
          disponible: plato.disponible
        });
      }
    }

    res.json({
      menuId: menu._id,
      menuNombre: menu.nombre,
      descripcion: menu.descripcion,
      precios: menu.precios,
      precioCompleto: menu.precioCompleto,
      items
    });
  } catch (error) {
    console.error('Error en getMenuHoy:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMisPedidos = async (req, res) => {
  try {
    const prefijo = '📱';
    const pedidos = await Pedido.find({
      mesa: { $regex: `^${prefijo}` },
      cliente: req.usuarioApp.nombre
    }).sort({ createdAt: -1 });

    res.json(pedidos);
  } catch (error) {
    console.error('Error en getMisPedidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const crearPedido = async (req, res) => {
  try {
    const { items, mesa, notas } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Debes incluir al menos un ítem en el pedido' });
    }

    const itemsMapeados = items.map(item => ({
      tipo: item.tipo || 'plato',
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
      observaciones: notas || ''
    }));

    const total = itemsMapeados.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    const mesaFinal = `📱 ${mesa || 'Para llevar'}`;
    const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    const pedido = new Pedido({
      cliente: req.usuarioApp.nombre,
      mesa: mesaFinal,
      items: itemsMapeados,
      total,
      hora,
      estado: 'pendiente',
      estadoPago: 'pendiente'
    });

    await pedido.save();

    if (global.io) {
      global.io.emit('pedido-creado', pedido);
    }

    res.status(201).json(pedido);
  } catch (error) {
    console.error('Error en crearPedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findOne({
      _id: req.params.id,
      cliente: req.usuarioApp.nombre,
      mesa: { $regex: '^📱' }
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(pedido);
  } catch (error) {
    console.error('Error en getPedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  registro,
  verificarEmail,
  login,
  reenviarVerificacion,
  getMenuHoy,
  getMisPedidos,
  crearPedido,
  getPedido
};
