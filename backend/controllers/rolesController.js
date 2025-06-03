const roles = [
  { id: 1, nombre: 'user' },
  { id: 2, nombre: 'admin' },
  { id: 3, nombre: 'superadmin' },
];

exports.ObtenerTodosLosRoles = (req, res) => {
  try {
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al obtener roles' });
  }
};
