const express = require('express');
const router = express.Router();
const platosController = require('../controllers/platosController');

router.get('/:tipo', platosController.getByTipo);
router.post('/', platosController.create);
router.put('/:id', platosController.update);
router.delete('/:id', platosController.delete);

module.exports = router;
