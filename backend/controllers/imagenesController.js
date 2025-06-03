const db = require('../db/connection');
const util = require('util');
const path = require('path');
const fs = require('fs');

const query = util.promisify(db.query).bind(db);

exports.obtenerImagenes = async (req, res) => {
  const { id_piso } = req.params;
  try {
    const results = await query('SELECT * FROM imagenes WHERE id_piso = ?', [id_piso]);
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener imágenes' });
  }
};

exports.subirImagen= async (req, res) => {
  const { id_piso } = req.params;
  const subtitulo = req.body.subtitulo || null;
  let url_imagen;
  if (req.file) {
    url_imagen = `/uploads/${req.file.filename}`;
  } else if (req.body.url_imagen) {
    url_imagen = req.body.url_imagen;
  } else {
    return res.status(400).json({ error: 'Debe proporcionar una imagen' });
  }
  try {
    const result = await query(
      'INSERT INTO imagenes (id_piso, url_imagen, subtitulo) VALUES (?, ?, ?)',
      [id_piso, url_imagen, subtitulo]
    );
    res.status(201).json({ mensaje: 'Imagen subida correctamente', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar imagen' });
  }
};

exports.eliminarImagen = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await query('SELECT url_imagen FROM imagenes WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    const url = results[0].url_imagen;
    if (url.startsWith('/uploads/')) {
      const filepath = path.join(__dirname, '..', url);
      fs.unlink(filepath, err => err && console.error(err));
    }
    await query('DELETE FROM imagenes WHERE id = ?', [id]);
    res.status(200).json({ mensaje: 'Imagen eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
};
