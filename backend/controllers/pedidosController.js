const Pedido = require('../models/Pedido');
const Usuario = require('../models/Usuario');
const mongoose = require('mongoose');
const { emitirActualizacion } = require('../utils/helpers');

exports.getPedidosHoy = async (req, res) => {
  try {
    const { usuarioId } = req.query;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    let filtro = { createdAt: { $gte: hoy } };
    
    if (usuarioId) {
      const usuario = await Usuario.findById(usuarioId).populate('rol');
      
      if (usuario) {
        const permisos = usuario.rol.permisos || [];
        const puedeVerTodos = permisos.includes('pedidos.ver_todos') || 
                              permisos.includes('cocina.ver') || 
                              permisos.includes('caja.ver_reportes');
        
        if (!puedeVerTodos) {
          filtro['usuarioCreador._id'] = new mongoose.Types.ObjectId(usuarioId);
        }
      }
    }
    
    const pedidos = await Pedido.find(filtro).sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPedidosPorRango = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, usuarioId } = req.query;
    
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Debe proporcionar fechaInicio y fechaFin' });
    }

    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    let filtro = { 
      createdAt: { 
        $gte: inicio,
        $lte: fin
      } 
    };
    
    if (usuarioId) {
      const usuario = await Usuario.findById(usuarioId).populate('rol');
      
      if (usuario) {
        const permisos = usuario.rol.permisos || [];
        const puedeVerTodos = permisos.includes('pedidos.ver_todos') || 
                              permisos.includes('cocina.ver') || 
                              permisos.includes('caja.ver_reportes');
        
        if (!puedeVerTodos) {
          filtro['usuarioCreador._id'] = new mongoose.Types.ObjectId(usuarioId);
        }
      }
    }
    
    const pedidos = await Pedido.find(filtro).sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.crearPedido = async (req, res) => {
  try {
    const pedido = new Pedido(req.body);
    await pedido.save();
    emitirActualizacion('pedido-creado', pedido);
    res.status(201).json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.actualizarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    emitirActualizacion('pedido-actualizado', pedido);
    res.json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    pedido.estado = estado;
    
    if (estado === 'en_preparacion' && !pedido.inicioPreparacion) {
      pedido.inicioPreparacion = new Date();
    }
    
    if (estado === 'completado' && !pedido.finPreparacion) {
      pedido.finPreparacion = new Date();
    }
    
    await pedido.save();
    emitirActualizacion('pedido-actualizado', pedido);
    res.json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.registrarPago = async (req, res) => {
  try {
    const { metodoPago } = req.body;
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    pedido.estadoPago = 'pagado';
    pedido.metodoPago = metodoPago;
    
    await pedido.save();
    emitirActualizacion('pedido-pagado', pedido);
    res.json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.cancelarPedido = async (req, res) => {
  try {
    const { motivo, usuario } = req.body;
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    pedido.cancelado = true;
    pedido.motivoCancelacion = motivo;
    pedido.usuarioCancelacion = usuario;
    pedido.fechaCancelacion = new Date();
    pedido.estado = 'cancelado';
    
    await pedido.save();
    emitirActualizacion('pedido-cancelado', pedido);
    res.json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
