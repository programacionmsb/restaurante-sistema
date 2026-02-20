const express = require('express');
const router = express.Router();
const creditosController = require('../controllers/creditosController');

// Obtener clientes con deuda (filtrado por permisos)
router.get('/clientes', creditosController.getClientesConDeuda);

// Obtener pedidos de un cliente específico
router.get('/cliente/:nombreCliente', creditosController.getPedidosCliente);

// Procesar pago de crédito
router.post('/pagar', creditosController.procesarPago);

// Crear crédito (marcar pedido como crédito)
router.post('/crear', creditosController.crearCredito);

// Obtener reporte de créditos
router.get('/reporte', creditosController.getReporteCreditos);

module.exports = router;