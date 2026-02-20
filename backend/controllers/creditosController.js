const Pedido = require('../models/Pedido');
const Usuario = require('../models/Usuario');
const { emitirActualizacion } = require('../utils/helpers');

// Obtener clientes con deuda (filtrado por permisos)
exports.getClientesConDeuda = async (req, res) => {
  try {
    const { usuarioId, permisos } = req.query;

    // Construir filtro base
    let filtro = {
      estadoPago: { $in: ['credito', 'pagado_parcial'] }
    };

    // Aplicar filtro según permisos
    const tieneVerTodos = permisos && permisos.includes('creditos.ver_todos');
    
    if (!tieneVerTodos) {
      // Solo sus créditos
      filtro['usuarioCreador._id'] = usuarioId;
    }

    // Obtener pedidos agrupados por cliente
    const pedidos = await Pedido.find(filtro).sort({ createdAt: 1 });

    // Agrupar por cliente
    const clientesMap = {};
    
    pedidos.forEach(pedido => {
      const nombreCliente = pedido.credito.clienteNombre || 'Sin nombre';
      
      if (!clientesMap[nombreCliente]) {
        clientesMap[nombreCliente] = {
          nombre: nombreCliente,
          telefono: pedido.credito.clienteTelefono || '',
          totalDeuda: 0,
          cantidadPedidos: 0,
          pedidos: [],
          mesero: pedido.usuarioCreador
        };
      }
      
      clientesMap[nombreCliente].totalDeuda += pedido.montoRestante;
      clientesMap[nombreCliente].cantidadPedidos++;
      clientesMap[nombreCliente].pedidos.push({
        _id: pedido._id,
        mesa: pedido.mesa,
        fecha: pedido.createdAt,
        total: pedido.total,
        montoPagado: pedido.montoPagado,
        montoRestante: pedido.montoRestante,
        estadoPago: pedido.estadoPago
      });
    });

    // Convertir a array y ordenar por deuda
    const clientes = Object.values(clientesMap).sort((a, b) => b.totalDeuda - a.totalDeuda);

    // Asegurar que sea un array válido
    const clientesArray = Array.isArray(clientes) ? clientes : Array.from(clientes);

    res.json(clientesArray);
  } catch (error) {
    console.error('Error obteniendo clientes con deuda:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener pedidos de un cliente específico
exports.getPedidosCliente = async (req, res) => {
  try {
    const { nombreCliente } = req.params;
    const { usuarioId, permisos } = req.query;

    let filtro = {
      'credito.clienteNombre': nombreCliente,
      estadoPago: { $in: ['credito', 'pagado_parcial'] }
    };

    // Aplicar filtro según permisos
    const tieneVerTodos = permisos && permisos.includes('creditos.ver_todos');
    
    if (!tieneVerTodos) {
      filtro['usuarioCreador._id'] = usuarioId;
    }

    const pedidos = await Pedido.find(filtro).sort({ createdAt: 1 });

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'No se encontraron pedidos para este cliente' });
    }

    // Calcular totales
    const totalDeuda = pedidos.reduce((sum, p) => sum + p.montoRestante, 0);
    const totalOriginal = pedidos.reduce((sum, p) => sum + p.total, 0);
    const totalPagado = pedidos.reduce((sum, p) => sum + p.montoPagado, 0);

    res.json({
      cliente: {
        nombre: nombreCliente,
        telefono: pedidos[0].credito.clienteTelefono || '',
        mesero: pedidos[0].usuarioCreador
      },
      resumen: {
        totalOriginal,
        totalPagado,
        totalDeuda,
        cantidadPedidos: pedidos.length
      },
      pedidos: pedidos.map(p => ({
        _id: p._id,
        mesa: p.mesa,
        fecha: p.createdAt,
        total: p.total,
        montoPagado: p.montoPagado,
        montoRestante: p.montoRestante,
        estadoPago: p.estadoPago,
        items: p.items,
        pagos: p.pagos
      }))
    });
  } catch (error) {
    console.error('Error obteniendo pedidos del cliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// Procesar pago de crédito (con algoritmo FIFO)
exports.procesarPago = async (req, res) => {
  try {
    const { nombreCliente, monto, metodoPago, pagarTodo, usuarioId } = req.body;

    if (!nombreCliente || !metodoPago || !usuarioId) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (!pagarTodo && (!monto || monto <= 0)) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }

    // Obtener usuario que está cobrando
    const usuario = await Usuario.findById(usuarioId).populate('rol');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener pedidos del cliente ordenados por fecha (FIFO)
    const pedidos = await Pedido.find({
      'credito.clienteNombre': nombreCliente,
      estadoPago: { $in: ['credito', 'pagado_parcial'] }
    }).sort({ createdAt: 1 });

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'No hay pedidos pendientes para este cliente' });
    }

    // Calcular total de deuda
    const deudaTotal = pedidos.reduce((sum, p) => sum + p.montoRestante, 0);

    // Determinar monto a pagar
    let montoPagar = pagarTodo ? deudaTotal : parseFloat(monto);

    if (montoPagar > deudaTotal) {
      return res.status(400).json({ 
        error: `El monto a pagar (S/ ${montoPagar.toFixed(2)}) excede la deuda total (S/ ${deudaTotal.toFixed(2)})` 
      });
    }

    // Verificar permisos para cada pedido
    const tieneCobrasTodos = usuario.rol.permisos.includes('creditos.cobrar_todos');
    
    for (const pedido of pedidos) {
      const esSuPedido = pedido.usuarioCreador._id.toString() === usuarioId;
      
      if (!esSuPedido && !tieneCobrasTodos) {
        return res.status(403).json({ 
          error: 'No tienes permiso para cobrar créditos de otros meseros. Solo puedes cobrar tus propios créditos.' 
        });
      }
    }

    // Aplicar pago con algoritmo FIFO
    let montoDisponible = montoPagar;
    const pedidosActualizados = [];
    const resumenAplicacion = [];

    for (const pedido of pedidos) {
      if (montoDisponible <= 0) break;

      const montoPagarPedido = Math.min(montoDisponible, pedido.montoRestante);
      
      // Registrar pago
      const nuevoPago = {
        monto: montoPagarPedido,
        metodoPago,
        fecha: new Date(),
        cobradoPor: {
          _id: usuario._id,
          nombre: usuario.nombre,
          usuario: usuario.usuario,
          rol: usuario.rol.nombre
        }
      };

      pedido.pagos.push(nuevoPago);
      pedido.montoPagado += montoPagarPedido;
      pedido.montoRestante -= montoPagarPedido;

      // Actualizar estado
      if (pedido.montoRestante <= 0.01) { // Margen para redondeo
        pedido.estadoPago = 'pagado';
        pedido.metodoPago = metodoPago;
        pedido.montoRestante = 0;
      } else {
        pedido.estadoPago = 'pagado_parcial';
      }

      await pedido.save();
      pedidosActualizados.push(pedido);

      // Resumen
      resumenAplicacion.push({
        pedidoId: pedido._id,
        mesa: pedido.mesa,
        montoPagado: montoPagarPedido,
        nuevoEstado: pedido.estadoPago,
        restante: pedido.montoRestante
      });

      montoDisponible -= montoPagarPedido;
    }

    // Calcular nueva deuda
    const nuevaDeuda = pedidos.reduce((sum, p) => sum + p.montoRestante, 0);

    // Emitir actualización
    emitirActualizacion('credito-cobrado', {
      cliente: nombreCliente,
      montoPagado: montoPagar,
      metodoPago,
      pedidosActualizados: pedidosActualizados.length,
      nuevaDeuda
    });

    res.json({
      success: true,
      mensaje: 'Pago procesado exitosamente',
      detalles: {
        cliente: nombreCliente,
        montoPagado: montoPagar,
        metodoPago,
        deudaAnterior: deudaTotal,
        nuevaDeuda,
        pedidosAfectados: pedidosActualizados.length,
        aplicacion: resumenAplicacion
      }
    });

  } catch (error) {
    console.error('Error procesando pago:', error);
    res.status(500).json({ error: error.message });
  }
};

// Crear crédito (marcar pedido como crédito)
exports.crearCredito = async (req, res) => {
  try {
    const { pedidoId, clienteNombre, clienteTelefono, notas, usuarioId } = req.body;

    if (!pedidoId || !clienteNombre || !usuarioId) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Verificar que el usuario tenga permiso para crear créditos
    const usuario = await Usuario.findById(usuarioId).populate('rol');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!usuario.rol.permisos.includes('creditos.crear')) {
      return res.status(403).json({ error: 'No tienes permiso para autorizar créditos' });
    }

    // Obtener pedido
    const pedido = await Pedido.findById(pedidoId);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedido.estadoPago !== 'pendiente') {
      return res.status(400).json({ error: 'El pedido ya ha sido procesado' });
    }

    // Actualizar pedido
    pedido.estadoPago = 'credito';
    pedido.montoRestante = pedido.total;
    pedido.credito = {
      clienteNombre,
      clienteTelefono: clienteTelefono || '',
      notas: notas || '',
      fechaCredito: new Date(),
      autorizadoPor: {
        _id: usuario._id,
        nombre: usuario.nombre,
        usuario: usuario.usuario
      }
    };

    await pedido.save();

    emitirActualizacion('credito-creado', pedido);

    res.json({
      success: true,
      mensaje: 'Crédito creado exitosamente',
      pedido
    });

  } catch (error) {
    console.error('Error creando crédito:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener reporte de créditos
exports.getReporteCreditos = async (req, res) => {
  try {
    const { usuarioId, permisos } = req.query;

    let filtro = {
      estadoPago: { $in: ['credito', 'pagado_parcial'] }
    };

    // Aplicar filtro según permisos
    const tieneVerTodos = permisos && permisos.includes('creditos.ver_todos');
    
    if (!tieneVerTodos) {
      filtro['usuarioCreador._id'] = usuarioId;
    }

    const pedidos = await Pedido.find(filtro);

    // Calcular métricas
    const totalDeuda = pedidos.reduce((sum, p) => sum + p.montoRestante, 0);
    const totalOriginal = pedidos.reduce((sum, p) => sum + p.total, 0);
    const totalPagadoParcial = pedidos.reduce((sum, p) => sum + p.montoPagado, 0);

    // Clientes únicos
    const clientesUnicos = [...new Set(pedidos.map(p => p.credito.clienteNombre))];

    // Por antigüedad
    const ahora = new Date();
    const pedidosPorAntiguedad = {
      hasta7dias: 0,
      de8a30dias: 0,
      mas30dias: 0
    };

    pedidos.forEach(p => {
      const dias = Math.floor((ahora - new Date(p.credito.fechaCredito)) / (1000 * 60 * 60 * 24));
      
      if (dias <= 7) {
        pedidosPorAntiguedad.hasta7dias += p.montoRestante;
      } else if (dias <= 30) {
        pedidosPorAntiguedad.de8a30dias += p.montoRestante;
      } else {
        pedidosPorAntiguedad.mas30dias += p.montoRestante;
      }
    });

    // Por mesero (solo si tiene permiso de ver todos)
    let porMesero = null;
    if (tieneVerTodos) {
      const meseroMap = {};
      
      pedidos.forEach(p => {
        const meseroId = p.usuarioCreador._id.toString();
        if (!meseroMap[meseroId]) {
          meseroMap[meseroId] = {
            nombre: p.usuarioCreador.nombre,
            totalDeuda: 0,
            cantidadPedidos: 0
          };
        }
        meseroMap[meseroId].totalDeuda += p.montoRestante;
        meseroMap[meseroId].cantidadPedidos++;
      });
      
      porMesero = Object.values(meseroMap).sort((a, b) => b.totalDeuda - a.totalDeuda);
    }

    res.json({
      resumen: {
        totalDeuda,
        totalOriginal,
        totalPagadoParcial,
        cantidadClientes: clientesUnicos.length,
        cantidadPedidos: pedidos.length
      },
      porAntiguedad: pedidosPorAntiguedad,
      porMesero
    });

  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ error: error.message });
  }
};