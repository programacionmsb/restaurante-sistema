const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');

router.get('/permisos-disponibles', rolesController.getPermisosDisponibles);
router.get('/', rolesController.getAll);
router.get('/:id', rolesController.getById);
router.post('/', rolesController.create);
router.put('/:id', rolesController.update);
router.delete('/:id', rolesController.delete);

module.exports = router;
