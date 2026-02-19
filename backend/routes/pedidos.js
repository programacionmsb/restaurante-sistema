const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');

router.get('/hoy', pedidosController.getPedidosHoy);
router.get('/rango', pedidosController.getPedidosPorRango);
router.post('/', pedidosController.crearPedido);
router.put('/:id', pedidosController.actualizarPedido);
router.patch('/:id/estado', pedidosController.actualizarEstado);
router.patch('/:id/pago', pedidosController.registrarPago);
router.patch('/:id/cancelar', pedidosController.cancelarPedido);

module.exports = router;
