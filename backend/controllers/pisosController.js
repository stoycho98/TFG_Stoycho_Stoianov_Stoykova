const db = require('../db/connection');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.obtenerComunidades = async (req, res) => {
  try {
    const results = await query(
      'SELECT comunidad_id AS comunidad_id, nombre_comunidad AS nombre FROM comunidad ORDER BY nombre_comunidad'
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al obtener comunidades' });
  }
};

exports.obtenerProvincias = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await query(
      'SELECT provincia_id AS provincia_id, nombre FROM provincia WHERE comunidad_id = ? ORDER BY nombre',
      [id]
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al obtener provincias' });
  }
};

exports.obtenerMunicipios = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await query(
      'SELECT municipio_id AS municipio_id, nombre_municipio AS nombre FROM municipio WHERE provincia_id = ? ORDER BY nombre_municipio',
      [id]
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al obtener municipios' });
  }
};

exports.ObtenerTodosLosPisos = async (req, res) => {
  try {
    const results = await query(
      `SELECT p.id, p.id_anfitrion, p.titulo, p.direccion, p.provincia_id,
              p.municipio_id, p.precio, p.maximo_huespedes,
              p.fecha_creacion, p.fecha_actualizacion,
              pr.nombre AS provincia, m.nombre_municipio AS municipio,
              c.nombre_comunidad AS comunidad
       FROM pisos p
       LEFT JOIN provincia pr ON p.provincia_id = pr.provincia_id
       LEFT JOIN municipio m ON p.municipio_id = m.municipio_id
       LEFT JOIN comunidad c ON pr.comunidad_id = c.comunidad_id
       ORDER BY p.id ASC`
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pisos' });
  }
};


exports.crearPiso = async (req, res) => {
  const {
    id_anfitrion,
    titulo,
    descripcion = '',
    direccion,
    provincia_id,
    municipio_id = null,
    precio,
    maximo_huespedes
  } = req.body;
  if (!titulo || titulo.trim().length < 5 || titulo.trim().length > 100) {
    return res.status(400).json({ error: 'El título debe tener entre 5 y 100 caracteres.' });
  }
  if (!direccion || direccion.trim().length < 5 || direccion.trim().length > 100) {
    return res.status(400).json({ error: 'La dirección debe tener entre 5 y 100 caracteres.' });
  }
  if (descripcion && descripcion.trim().length > 100) {
    return res.status(400).json({ error: 'La descripción debe tener como máximo 100 caracteres.' });
  }
  if (isNaN(precio) || precio < 1 || precio > 100000) {
    return res.status(400).json({ error: 'El precio debe estar entre 1 y 100.000 euros.' });
  }
  if (isNaN(maximo_huespedes) || maximo_huespedes < 1 || maximo_huespedes > 100) {
    return res.status(400).json({ error: 'El número máximo de huéspedes debe ser entre 1 y 100.' });
  }
  if (!provincia_id || provincia_id === '') {
    return res.status(400).json({ error: 'Debes seleccionar una provincia.' });
  }
  if (!municipio_id || municipio_id === '') {
    return res.status(400).json({ error: 'Debes seleccionar un municipio.' });
  }

  if (!id_anfitrion) {
    return res.status(400).json({ error: 'Falta el anfitrión.' });
  }

  try {
    const result = await query(
      `INSERT INTO pisos
         (id_anfitrion, titulo, descripcion, direccion,
          provincia_id, municipio_id, precio, maximo_huespedes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_anfitrion, titulo, descripcion, direccion, provincia_id, municipio_id, precio, maximo_huespedes]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear piso' });
  }
};


exports.borrarPiso = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM pisos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Piso no encontrado' });
    }
    res.json({ message: 'Piso eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al borrar piso' });
  }
};
