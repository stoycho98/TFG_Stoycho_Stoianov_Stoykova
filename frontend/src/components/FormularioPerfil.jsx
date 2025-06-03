import { useState } from 'react';
import axios from 'axios';

export default function FormularioPerfil({ usuario, onPerfilActualizado }) {
  const [valorNombre, setValorNombre] = useState(usuario.nombre);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!contrasenaActual) {
      setMensaje('❌ Debes introducir tu contraseña actual');
      return;
    }
    if (nuevaContrasena && nuevaContrasena !== confirmarContrasena) {
      setMensaje('❌ Las contraseñas nuevas no coinciden');
      return;
    }

    setCargando(true);
    try {
      const payload = {
        nombre: valorNombre,
        contrasena_actual: contrasenaActual
      };
      if (nuevaContrasena) payload.contrasena = nuevaContrasena;

      const { data } = await axios.put(`/usuarios/${usuario.id}`, payload);
      setMensaje('✅ Perfil actualizado con éxito');
      onPerfilActualizado(data);
    } catch (err) {
      console.error(err);
      setMensaje('❌ ' + (err.response?.data?.error || 'Error al actualizar perfil'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center py-5">
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <h2 className="mb-4 text-center text-warning">Editar Perfil</h2>

        <form onSubmit={manejarEnvio} className="form-yellow-black rounded p-4 shadow-sm">
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
              minLength={3}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={usuario.correo_electronico}
              readOnly
              disabled
            />
          </div>

          <div className="mb-3">
            <label htmlFor="passwordActual" className="form-label">Contraseña actual</label>
            <input
              type="password"
              id="passwordActual"
              className="form-control"
              placeholder="Introduce tu contraseña actual"
              value={contrasenaActual}
              onChange={e => setContrasenaActual(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Nueva contraseña</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Dejar en blanco para no cambiar"
              value={nuevaContrasena}
              onChange={e => setNuevaContrasena(e.target.value)}
              minLength={6}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label">Confirmar nueva contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              placeholder="Confirma la nueva contraseña"
              value={confirmarContrasena}
              onChange={e => setConfirmarContrasena(e.target.value)}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-yellow w-100"
            disabled={cargando}
          >
            {cargando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        {mensaje && (
          <div className={`alert mt-3 ${mensaje.includes('✅') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}
