const express = require('express');
const router = express.Router();
const cierreTurnoController = require('../controllers/cierreTurnoController');

// Generar nuevo cierre de turno
router.post('/', cierreTurnoController.generarCierre);

// Registrar entrega de efectivo
router.patch('/:cierreId/entregar', cierreTurnoController.registrarEntrega);

// Obtener cierres de un usuario específico
router.get('/usuario/:usuarioId', cierreTurnoController.getCierresPorUsuario);

// Verificar si tiene cierre pendiente
router.get('/usuario/:usuarioId/pendiente', cierreTurnoController.verificarCierrePendiente);

// Obtener todos los cierres (admin/supervisor)
router.get('/', cierreTurnoController.getAllCierres);

// Obtener cierre por ID
router.get('/:id', cierreTurnoController.getCierrePorId);

module.exports = router;
