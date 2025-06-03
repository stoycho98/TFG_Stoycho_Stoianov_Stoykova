const jwt = require('jsonwebtoken');
const SECRETO = process.env.JWT_SECRET || 'tu_secreto';

module.exports = (req, res, next) => {
  const cabeceraAuth = req.headers.authorization;
  if (!cabeceraAuth) return res.status(401).json({ error: 'Token no proporcionado' });

  const partes = cabeceraAuth.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  const token = partes[1];
  try {
    const { id, nombre, id_rol } = jwt.verify(token, SECRETO);
    req.user = { id, nombre, id_rol };
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
