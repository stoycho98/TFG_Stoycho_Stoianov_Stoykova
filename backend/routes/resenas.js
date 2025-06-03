const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const resCtrl = require('../controllers/resenasController');

router.get('/piso/:piso_id', resCtrl.obtenerResenasPiso);
router.post('/', verifyToken, resCtrl.crearResena);

module.exports = router;