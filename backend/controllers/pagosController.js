const db = require('../db/connection');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.obtenerPagosUsuario = async (req, res) => {
  const id_huesped = req.user.id;
  const sql = `
    SELECT
      r.id AS reserva_id,
      r.id_piso,
      p.titulo,
      r.fecha_entrada,
      r.fecha_salida,
      r.precio_total,
      r.estado AS estado_reserva,
      COALESCE(pg.estado, 'sin pago') AS estado_pago,
      pg.metodo_pago
    FROM reservas r
    JOIN pisos p ON p.id = r.id_piso
    LEFT JOIN (
      SELECT id_reserva, estado, metodo_pago
      FROM pagos
      WHERE id IN (SELECT MAX(id) FROM pagos GROUP BY id_reserva)
    ) pg ON pg.id_reserva = r.id
    WHERE r.id_huesped = ?
    ORDER BY r.fecha_entrada DESC
  `;
  try {
    const rows = await query(sql, [id_huesped]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

exports.crearPago = async (req, res) => {
  const { id_reserva, metodo_pago } = req.body;
  try {
    const filas = await query(
      'SELECT precio_total FROM reservas WHERE id = ?',
      [id_reserva]
    );
    if (filas.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    const monto = filas[0].precio_total;
    const result = await query(
      `INSERT INTO pagos (id_reserva, monto, metodo_pago, estado)
       VALUES (?, ?, ?, 'completado')`,
      [id_reserva, monto, metodo_pago]
    );
    await query(
      `UPDATE reservas SET estado = 'confirmada' WHERE id = ?`,
      [id_reserva]
    );
    res.status(201).json({ id: result.insertId, monto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al registrar pago' });
  }
};

exports.obtenerIngresosAnfitrion = async (req, res) => {
  const id_anfitrion = req.user.id;
  const sql = `
    SELECT
      p.id AS id_piso,
      p.titulo,
      COALESCE(SUM(pay.monto), 0) AS total_ganado
    FROM pisos p
    LEFT JOIN reservas r ON r.id_piso = p.id
    LEFT JOIN pagos pay ON pay.id_reserva = r.id AND pay.estado = 'completado'
    WHERE p.id_anfitrion = ?
    GROUP BY p.id, p.titulo
    ORDER BY p.titulo
  `;
  try {
    const rows = await query(sql, [id_anfitrion]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
};
