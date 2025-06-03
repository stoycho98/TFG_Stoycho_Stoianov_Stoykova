const db = require('../db/connection');
const util = require('util');
const bcrypt = require('bcrypt');
const query = util.promisify(db.query).bind(db);

exports.ObtenerTodosLosUsuarios = async (req, res) => {
  if (![2, 3].includes(req.user.id_rol)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  try {
    const rows = await query(
      `SELECT id, nombre, correo_electronico, id_rol, estado, fecha_creacion, fecha_actualizacion
       FROM usuarios`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};


exports.crearUsuario = async (req, res) => {
  const { nombre, correo_electronico, contrasena } = req.body;
  const id_rol = req.body.id_rol || 1;

  const correoPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  if (!correo_electronico || !correo_electronico.includes('@')) {
    return res.status(400).json({ error: 'Correo no válido, falta el caracter @' });
  }
  if (!correoPattern.test(correo_electronico)) {
    return res.status(400).json({ error: 'Correo no válido, debe haber al menos un punto después de la @' });
  }
  if (!contrasena || contrasena.length < 6 || contrasena.length > 20) {
    return res.status(400).json({ error: 'La contraseña debe tener entre 6 y 20 caracteres' });
  }
  try {
    const hash = await bcrypt.hash(contrasena, 10);
    const result = await query(
      `INSERT INTO usuarios (nombre, correo_electronico, contrasena, id_rol)
       VALUES (?, ?, ?, ?)`,
      [nombre, correo_electronico, hash, id_rol]
    );
    res.status(201).json({ id: result.insertId, nombre, correo_electronico, id_rol });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, contrasena, contrasena_actual, id_rol, estado } = req.body;
  try {
    if (typeof id_rol !== 'undefined' || typeof estado !== 'undefined') {
      if (req.user.id_rol !== 3) {
        return res.status(403).json({ error: 'No tienes permiso para cambiar rol o estado' });
      }
      await query(
        `UPDATE usuarios
         SET id_rol = COALESCE(?, id_rol), estado = COALESCE(?, estado)
         WHERE id = ?`,
        [id_rol, estado, id]
      );
      const rows = await query(
        `SELECT id, nombre, correo_electronico, id_rol, estado, fecha_creacion, fecha_actualizacion
         FROM usuarios WHERE id = ?`,
        [id]
      );
      return res.json(rows[0]);
    }
    if (!nombre || nombre.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres' });
    }
    if (contrasena && contrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (!contrasena_actual) {
      return res.status(400).json({ error: 'Debes proporcionar tu contraseña actual' });
    }
    const rowsUser = await query('SELECT contrasena FROM usuarios WHERE id = ?', [id]);
    if (rowsUser.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const match = await bcrypt.compare(contrasena_actual, rowsUser[0].contrasena);
    if (!match) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }
    let sql = 'UPDATE usuarios SET nombre = ?';
    const params = [nombre];
    if (contrasena) {
      const hash = await bcrypt.hash(contrasena, 10);
      sql += ', contrasena = ?';
      params.push(hash);
    }
    sql += ' WHERE id = ?';
    params.push(id);
    const result = await query(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const rows = await query(
      `SELECT id, nombre, correo_electronico, id_rol, estado, fecha_creacion, fecha_actualizacion
       FROM usuarios WHERE id = ?`,
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};