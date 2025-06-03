import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FormularioLogin({ onLoginExitoso, switchToRegister }) {
  const [valorCorreo, setValorCorreo] = useState('');
  const [valorContrasena, setValorContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (localStorage.getItem('sesionExpirada')) {
      setMensaje('⚠️ Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      localStorage.removeItem('sesionExpirada');
    }
  }, []);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      const res = await axios.post('http://localhost:5000/auth/login', {
        correo_electronico: valorCorreo,
        contrasena: valorContrasena
      });

      const { token, usuario } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setMensaje('✅ Login exitoso');
      onLoginExitoso(usuario);

      setValorCorreo('');
      setValorContrasena('');
    } catch (error) {
      console.error('Error de login:', error);

      const mensajeServidor =
        error.response?.data?.error ||
        'Usuario o contraseña incorrecta';
      setMensaje(`❌ ${mensajeServidor}`);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center py-5">
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center text-warning">Iniciar sesión</h2>

        <form onSubmit={manejarLogin} className="form-yellow-black rounded p-4 shadow-sm">
          <div className="mb-3">
            <label htmlFor="correo" className="form-label">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              className="form-control"
              placeholder="nombre@correo.com"
              value={valorCorreo}
              onChange={(e) => setValorCorreo(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="contrasena" className="form-label">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              className="form-control"
              placeholder="********"
              value={valorContrasena}
              onChange={(e) => setValorContrasena(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-yellow w-100">Entrar</button>
        </form>

        {mensaje && (
          <div className={`alert mt-3 ${mensaje.startsWith('✅') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {mensaje}
          </div>
        )}

        <p className="mt-3 text-center">
          ¿Aún no tienes cuenta?{' '}
          <span
            onClick={switchToRegister}
            style={{ cursor: 'pointer' }}
            className="text-warning"
          >
            Registrate
          </span>
        </p>
      </div>
    </div>
  );
}
