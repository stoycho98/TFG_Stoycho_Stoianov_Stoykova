const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/imagenesController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', ctrl.obtenerImagenes);

router.post('/', upload.single('imagen'), ctrl.subirImagen);

router.delete('/:id', ctrl.eliminarImagen);

module.exports = router;