const express = require('express');
const router = express.Router();
const menuDiaController = require('../controllers/menuDiaController');

router.get('/hoy', menuDiaController.getHoy);
router.get('/fecha/:fecha', menuDiaController.getPorFecha);
router.get('/:id', menuDiaController.getById);
router.get('/', menuDiaController.getAll);
router.post('/', menuDiaController.create);
router.put('/:id', menuDiaController.update);
router.delete('/:id', menuDiaController.delete);
router.patch('/:id/toggle', menuDiaController.toggle);
router.patch('/:menuId/plato/:platoId/disponibilidad', menuDiaController.updateDisponibilidadPlato);

module.exports = router;
