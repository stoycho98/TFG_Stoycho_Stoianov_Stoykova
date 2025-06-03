const express = require('express');
const router = express.Router();
const usuariosCtrl = require('../controllers/usuariosController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', usuariosCtrl.ObtenerTodosLosUsuarios);
router.post('/', usuariosCtrl.crearUsuario);
router.use(verifyToken);
router.put('/:id', usuariosCtrl.actualizarUsuario);

module.exports = router;