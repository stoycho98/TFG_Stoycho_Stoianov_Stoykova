const db = require('../db/connection');
const util = require('util');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const query = util.promisify(db.query).bind(db);

exports.login = async (req, res) => {
  const { correo_electronico, contrasena } = req.body;
  if (!correo_electronico || !contrasena) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    const results = await query(
      'SELECT contrasena FROM usuarios WHERE correo_electronico = ?',
      [correo_electronico]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const hash = results[0].contrasena;
    const match = await bcrypt.compare(contrasena, hash);

    if (!match) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const usuarios = await query(
      `SELECT id, nombre, correo_electronico, id_rol, estado
         FROM usuarios
        WHERE correo_electronico = ?`,
      [correo_electronico]
    );

    const user = usuarios[0];
    if (user.estado === 0) {
      return res.status(403).json({ error: '¡Ups! Tu cuenta ha sido bloqueada por un administrador' });
    }

    const payload = {
      id: user.id,
      nombre: user.nombre,
      correo_electronico: user.correo_electronico,
      id_rol: user.id_rol
    };

    let token;
    try {
      token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
      });
    } catch (tokenErr) {
      console.error('Error al firmar JWT:', tokenErr);
      return res.status(500).json({ error: tokenErr.message });
    }

    res.json({ token, usuario: payload });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
};
