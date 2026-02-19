const CierreTurno = require('../models/CierreTurno');
const Pedido = require('../models/Pedido');
const Usuario = require('../models/Usuario');
const { emitirActualizacion } = require('../utils/helpers');

// Generar cierre de turno
exports.generarCierre = async (req, res) => {
  try {
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ error: 'Se requiere el ID del usuario' });
    }

    // Obtener datos del usuario
    const usuario = await Usuario.findById(usuarioId).populate('rol');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener pedidos pagados del día actual del usuario
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const pedidos = await Pedido.find({
      'usuarioCreador._id': usuarioId,
      estadoPago: 'pagado',
      createdAt: { $gte: hoy, $lt: manana }
    }).sort({ createdAt: 1 });

    if (pedidos.length === 0) {
      return res.status(400).json({ error: 'No hay pedidos pagados para cerrar el turno' });
    }

    // Calcular resumen
    let totalVentas = 0;
    let efectivo = 0;
    let yape = 0;
    let transferencia = 0;

    const pedidosResumen = pedidos.map(p => {
      totalVentas += p.total;
      
      if (p.metodoPago === 'efectivo') efectivo += p.total;
      else if (p.metodoPago === 'yape') yape += p.total;
      else if (p.metodoPago === 'transferencia') transferencia += p.total;

      return {
        pedidoId: p._id,
        cliente: p.cliente,
        mesa: p.mesa,
        total: p.total,
        metodoPago: p.metodoPago,
        hora: p.hora || new Date(p.createdAt).toLocaleTimeString('es-PE')
      };
    });

    // Obtener hora de inicio (primer pedido) y fin (último pedido)
    const turnoInicio = pedidos[0].createdAt;
    const turnoFin = pedidos[pedidos.length - 1].createdAt;

    // Crear cierre de turno
    const cierre = new CierreTurno({
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        usuario: usuario.usuario
      },
      fecha: new Date(),
      turno: {
        inicio: turnoInicio,
        fin: turnoFin
      },
      resumen: {
        totalPedidos: pedidos.length,
        totalVentas,
        efectivo,
        yape,
        transferencia
      },
      pedidos: pedidosResumen
    });

    await cierre.save();
    emitirActualizacion('cierre-creado', cierre);

    res.status(201).json(cierre);
  } catch (error) {
    console.error('Error generando cierre:', error);
    res.status(500).json({ error: error.message });
  }
};

// Registrar entrega del efectivo
exports.registrarEntrega = async (req, res) => {
  try {
    const { cierreId } = req.params;
    const { montoEntregado, supervisorId, observaciones } = req.body;

    const cierre = await CierreTurno.findById(cierreId);
    if (!cierre) {
      return res.status(404).json({ error: 'Cierre de turno no encontrado' });
    }

    if (cierre.entregado) {
      return res.status(400).json({ error: 'Este cierre ya fue registrado como entregado' });
    }

    // Obtener datos del supervisor
    const supervisor = await Usuario.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ error: 'Supervisor no encontrado' });
    }

    // Calcular diferencia
    const diferencia = montoEntregado - cierre.resumen.efectivo;

    cierre.entregado = true;
    cierre.montoEntregado = montoEntregado;
    cierre.diferencia = diferencia;
    cierre.supervisorRecibe = {
      _id: supervisor._id,
      nombre: supervisor.nombre,
      usuario: supervisor.usuario
    };
    cierre.fechaEntrega = new Date();
    cierre.observaciones = observaciones || '';

    await cierre.save();
    emitirActualizacion('cierre-entregado', cierre);

    res.json(cierre);
  } catch (error) {
    console.error('Error registrando entrega:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener cierres de un usuario
exports.getCierresPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { limite = 10 } = req.query;

    const cierres = await CierreTurno.find({ 'usuario._id': usuarioId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limite));

    res.json(cierres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los cierres (para admin/supervisor)
exports.getAllCierres = async (req, res) => {
  try {
    const { fecha, usuarioId, limite = 50 } = req.query;

    let filtro = {};

    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
      filtro.fecha = { $gte: fechaInicio, $lte: fechaFin };
    }

    if (usuarioId) {
      filtro['usuario._id'] = usuarioId;
    }

    const cierres = await CierreTurno.find(filtro)
      .sort({ createdAt: -1 })
      .limit(parseInt(limite));

    res.json(cierres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener cierre por ID
exports.getCierrePorId = async (req, res) => {
  try {
    const cierre = await CierreTurno.findById(req.params.id);
    
    if (!cierre) {
      return res.status(404).json({ error: 'Cierre no encontrado' });
    }

    res.json(cierre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verificar si el usuario tiene cierre pendiente de hoy
exports.verificarCierrePendiente = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const cierrePendiente = await CierreTurno.findOne({
      'usuario._id': usuarioId,
      fecha: { $gte: hoy },
      entregado: false
    });

    res.json({ 
      tieneCierrePendiente: !!cierrePendiente,
      cierre: cierrePendiente
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
