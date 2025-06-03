const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const pagosCtrl = require('../controllers/pagosController');

router.use(verifyToken);

router.get('/', pagosCtrl.obtenerPagosUsuario);
router.get('/anfitrion/ingresos', pagosCtrl.obtenerIngresosAnfitrion);
router.post('/', pagosCtrl.crearPago);

module.exports = router;