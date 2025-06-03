const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const reservasCtrl = require('../controllers/reservasController');

router.post('/', verifyToken, reservasCtrl.crearReserva);
router.get('/piso/:id_piso/confirmadas', verifyToken, reservasCtrl.obtenerReservasPisoConfirmada);

router.delete('/:id', verifyToken, reservasCtrl.cancelarReserva);

module.exports = router;
