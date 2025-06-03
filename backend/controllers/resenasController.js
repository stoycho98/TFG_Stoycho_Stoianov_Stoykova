const db = require('../db/connection');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.obtenerResenasPiso = async (req, res) => {
  const { piso_id } = req.params;
  try {
    const sql = `SELECT r.puntuacion, r.comentario, r.fecha_creacion, u.nombre AS revisor
                  FROM resenas r
                  JOIN usuarios u ON u.id = r.id_revisor
                  WHERE r.id_piso = ?
                  ORDER BY r.fecha_creacion DESC`;
    const rows = await query(sql, [piso_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

exports.crearResena = async (req, res) => {
  const id_revisor = req.user.id;
  const { id_piso, puntuacion, comentario } = req.body;
  try {
    const pagoSQL = `SELECT 1
                     FROM pagos pg
                     JOIN reservas r ON pg.id_reserva = r.id
                     WHERE r.id_piso = ? AND r.id_huesped = ? AND pg.estado = 'completado'
                     LIMIT 1`;
    const pagado = await query(pagoSQL, [id_piso, id_revisor]);
    if (pagado.length === 0) {
      return res.status(403).json({ error: 'Solo puedes reseñar si has pagado este piso' });
    }
    const insertSQL = `INSERT INTO resenas (id_piso, id_revisor, puntuacion, comentario)
                       VALUES (?, ?, ?, ?)`;
    await query(insertSQL, [id_piso, id_revisor, puntuacion, comentario]);
    res.status(201).json({ message: 'Reseña creada' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya has reseñado este piso' });
    }
    res.status(500).json({ error: 'Error al crear reseña' });
  }
};