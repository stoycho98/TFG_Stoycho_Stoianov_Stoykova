const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');

router.get('/', rolesController.ObtenerTodosLosRoles);

module.exports = router;
