import { useState } from 'react';
import axios from 'axios';

export default function FormularioRegistro({ onRegisterSuccess, switchToLogin }) {
  const [valorNombre, setValorNombre] = useState('');
  const [valorCorreo, setValorCorreo] = useState('');
  const [valorContrasena, setValorContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      await axios.post('/usuarios', {
        nombre: valorNombre,
        correo_electronico: valorCorreo,
        contrasena: valorContrasena
      });

      setMensaje('✅ Usuario registrado correctamente');
      onRegisterSuccess?.();

      setValorNombre('');
      setValorCorreo('');
      setValorContrasena('');
    } catch (error) {
      if (error.response?.status === 409) {
        setMensaje('❌ El correo ya está registrado');
      } else {
        console.error('Error al registrar usuario:', error);
        const msg = error.response?.data?.error || 'Error al registrar el usuario';
        setMensaje(`❌ ${msg}`);
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center py-5">
      <div className="w-100" style={{ maxWidth: '450px' }}>
        <h2 className="mb-4 text-center text-warning">Registro de Usuario</h2>
        <form onSubmit={manejarRegistro} className="form-yellow-black rounded p-4 shadow-sm">
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <input
              type="text"
              id="nombre"
              className="form-control"
              placeholder="Tu nombre"
              value={valorNombre}
              onChange={e => setValorNombre(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="correo" className="form-label">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              className="form-control"
              placeholder="nombre@correo.com"
              value={valorCorreo}
              onChange={e => setValorCorreo(e.target.value)}
              required
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
              onChange={e => setValorContrasena(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-yellow w-100">Registrarse</button>
        </form>

        {mensaje && (
          <div className={`alert mt-3 ${mensaje.startsWith('✅') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {mensaje}
          </div>
        )}

        <p className="mt-3 text-center">
          ¿Ya tienes cuenta?{' '}
          <span
            onClick={switchToLogin}
            style={{ cursor: 'pointer' }}
            className="text-warning"
          >
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
}
