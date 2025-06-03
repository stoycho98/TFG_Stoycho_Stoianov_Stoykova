const db = require('../db/connection');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.crearReserva = async (req, res) => {
  try {
    const { id_piso, fecha_entrada, fecha_salida } = req.body;
    const id_huesped = req.user.id;
    if (!id_piso || !fecha_entrada || !fecha_salida) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const entrada = new Date(fecha_entrada);
    const salida = new Date(fecha_salida);
    if (isNaN(entrada) || isNaN(salida)) {
      return res.status(400).json({ error: 'Formato de fecha inválido (YYYY-MM-DD)' });
    }
    if (salida <= entrada) {
      return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la de entrada' });
    }
    const solapadas = await query(
      `SELECT id FROM reservas
       WHERE id_piso = ?
         AND NOT (fecha_salida < ? OR fecha_entrada > ?)`,
      [id_piso, fecha_entrada, fecha_salida]
    );
    if (solapadas.length > 0) {
      return res.status(409).json({ error: 'Fechas no disponibles para este piso' });
    }
    const pisoRows = await query('SELECT precio FROM pisos WHERE id = ?', [id_piso]);
    if (pisoRows.length === 0) {
      return res.status(404).json({ error: 'Piso no encontrado' });
    }
    const precioNoche = parseFloat(pisoRows[0].precio);
    const msPorDia = 1000 * 60 * 60 * 24;
    const noches = Math.ceil((salida - entrada) / msPorDia);
    const precio_total = Number((precioNoche * noches).toFixed(2));
    const result = await query(
      `INSERT INTO reservas
         (id_piso, id_huesped, fecha_entrada, fecha_salida, precio_total)
       VALUES (?, ?, ?, ?, ?)`,
      [id_piso, id_huesped, fecha_entrada, fecha_salida, precio_total]
    );
    res.status(201).json({ id: result.insertId, precio_total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al crear reserva' });
  }
};


exports.obtenerReservasPisoConfirmada = async (req, res) => {
  try {
    const { id_piso } = req.params;
    const sql = `
      SELECT
        r.id, r.id_huesped AS usuario_id, u.nombre AS usuario_nombre,
        r.fecha_entrada, r.fecha_salida, r.precio_total,
        r.estado, r.fecha_creacion, r.fecha_actualizacion
      FROM reservas r
      JOIN usuarios u ON r.id_huesped = u.id
      WHERE r.id_piso = ? AND r.estado = 'confirmada'
      ORDER BY r.fecha_entrada DESC`;
    const results = await query(sql, [id_piso]);
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al obtener reservas del piso' });
  }
};

exports.cancelarReserva = async (req, res) => {
  try {
    const id_huesped = req.user.id;
    const { id } = req.params;
    const result = await query(
      'DELETE FROM reservas WHERE id = ? AND id_huesped = ?',
      [id, id_huesped]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada o sin permiso para cancelar' });
    }
    res.status(200).json({ mensaje: 'Reserva cancelada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al cancelar reserva' });
  }
};
