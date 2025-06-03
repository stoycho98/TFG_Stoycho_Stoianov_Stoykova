const express = require('express');
const router = express.Router();
const pisosCtrl = require('../controllers/pisosController');

router.get('/comunidades', pisosCtrl.obtenerComunidades);
router.get('/comunidades/:id/provincias', pisosCtrl.obtenerProvincias);
router.get('/provincias/:id/municipios', pisosCtrl.obtenerMunicipios);
router.get('/', pisosCtrl.ObtenerTodosLosPisos);
router.post('/', pisosCtrl.crearPiso);
router.delete('/:id', pisosCtrl.borrarPiso);

module.exports = router;