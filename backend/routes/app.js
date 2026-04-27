const router = require('express').Router();
const ctrl = require('../controllers/appController');
const authApp = require('../middleware/authApp');

router.post('/registro', ctrl.registro);
router.post('/login', ctrl.login);
router.post('/reenviar-verificacion', ctrl.reenviarVerificacion);
router.get('/verificar/:token', ctrl.verificarEmail);
router.get('/menu', ctrl.getMenuHoy);
router.get('/mis-pedidos', authApp, ctrl.getMisPedidos);
router.post('/pedidos', authApp, ctrl.crearPedido);
router.get('/pedidos/:id', authApp, ctrl.getPedido);

module.exports = router;
