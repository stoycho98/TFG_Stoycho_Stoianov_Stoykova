require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
require('./db/connection');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const verifyToken = require('./middlewares/verifyToken');
const authRoutes = require('./routes/auth');
const pisosRoutes = require('./routes/pisos');
const imagenesRoutes = require('./routes/imagenes');
const usuariosRoutes = require('./routes/usuarios');
const rolesRoutes = require('./routes/roles');
const reservasRoutes = require('./routes/reservas');
const pagosRoutes = require('./routes/pagos');
const resenasRoutes = require('./routes/resenas');

app.use('/auth', authRoutes);
app.use('/usuarios', usuariosRoutes);

app.use('/roles', verifyToken, rolesRoutes);

app.use('/pisos', pisosRoutes);

app.use('/pisos/:id_piso/imagenes', imagenesRoutes); 
app.use('/imagenes', imagenesRoutes);

app.use('/reservas', verifyToken, reservasRoutes);
app.use('/pagos', pagosRoutes);

app.use('/resenas', resenasRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
