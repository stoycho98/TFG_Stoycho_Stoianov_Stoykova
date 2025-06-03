import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header({ usuario, onLogout, modoOscuro, setModoOscuro }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  function MenuBotones({ modo = "pc" }) {
    const btnClass = modo === "pc" ? "btn btn-sm btn-outline-yellow" : "btn btn-yellow";
    const extraClass = modo === "pc" ? "" : "mb-1";
    const rutaActual = location.pathname;

    return (
      <>
        {modo === "movil" && (
          <button
            className={`${btnClass} ${extraClass}`}
            onClick={() => setModoOscuro(m => !m)}
            title={modoOscuro ? "Modo día" : "Modo oscuro"}
          >
            {modoOscuro ? "🌙 Oscuro" : "☀️ Día"}
          </button>
        )}
        {usuario ? (
          <>
            <Link to="/reservas"
              className={`${btnClass} ${rutaActual === '/reservas' ? 'active' : ''} ${extraClass}`}
              onClick={() => { if (modo === "movil") setMenuAbierto(false); }}>
              🔍 Ver pisos
            </Link>
            <Link to="/mis-pisos"
              className={`${btnClass} ${rutaActual === '/mis-pisos' ? 'active' : ''} ${extraClass}`}
              onClick={() => { if (modo === "movil") setMenuAbierto(false); }}>
              📋 Mis pisos
            </Link>
            <Link to="/mis-pagos"
              className={`${btnClass} ${rutaActual === '/mis-pagos' ? 'active' : ''} ${extraClass}`}
              onClick={() => { if (modo === "movil") setMenuAbierto(false); }}>
              💳 Mis pagos
            </Link>
            <Link to="/crear-piso"
              className={`btn btn-sm btn-yellow ${rutaActual === '/crear-piso' ? 'active' : ''} ${extraClass}`}
              onClick={() => { if (modo === "movil") setMenuAbierto(false); }}>
              🏠 Crear piso
            </Link>
            <Link to="/perfil"
              className={`${btnClass} ${rutaActual === '/perfil' ? 'active' : ''} ${extraClass}`}
              onClick={() => { if (modo === "movil") setMenuAbierto(false); }}>
              👤 Mi perfil
            </Link>
            {[2, 3].includes(usuario.id_rol) && (
              <Link to="/superadmin"
                className={`${btnClass} ${rutaActual === '/superadmin' ? 'active' : ''} ${extraClass}`}
                onClick={() => { if (modo === "movil") setMenuAbierto(false); }}>
                🛠 Panel Superadmin
              </Link>
            )}
            <span className={`text-light ms-${modo === "pc" ? 3 : 2}`}>¡Hola, {usuario.nombre}!</span>
            <button className={`${btnClass} ${extraClass}`}
              onClick={() => { onLogout(); if (modo === "movil") setMenuAbierto(false); }}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/"
              className={`${btnClass} ${rutaActual === '/' ? 'fw-bold' : ''} ${extraClass}`}
              onClick={() => { if (modo === "movil") setMenuAbierto(false); }}>
              🔍 Ver pisos
            </Link>
            <Link to="/login"
              className={`${btnClass} ${rutaActual === '/login' ? 'fw-bold' : ''} ${extraClass}`}
              onClick={() => { if (modo === "movil") setMenuAbierto(false); }}>
              Iniciar sesión
            </Link>
            <Link to="/register"
              className={`${btnClass} ${rutaActual === '/register' ? 'fw-bold' : ''} ${extraClass}`}
              onClick={() => { if (modo === "movil") setMenuAbierto(false); }}>
              Registrarse
            </Link>
          </>
        )}
      </>
    );
  }

  return (
    <header className="header-yellow-black py-3 fixed-top">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <h1 className="h5 mb-0">
              {usuario && [2, 3].includes(usuario.id_rol)
                ? "Administración"
                : "Gestión de alquileres de pisos🏡"}
            </h1>

            <button
              className="btn btn-sm btn-outline-yellow ms-2 d-none d-lg-inline"
              onClick={() => setModoOscuro(m => !m)}
              title={modoOscuro ? "Modo día" : "Modo oscuro"}
            >
              {modoOscuro ? "🌙 Oscuro" : "☀️ Día"}
            </button>
          </div>
          <button
            className="btn btn-sm btn-outline-yellow d-lg-none"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            ☰
          </button>
          <div className="d-none d-lg-flex align-items-center gap-2">
            <MenuBotones modo="pc" />
          </div>
        </div>
        <div className={`mobile-menu d-lg-none mt-3 ${menuAbierto ? 'open' : ''}`}>
          <div className="d-flex flex-column gap-2">
            <MenuBotones modo="movil" />
          </div>
        </div>
      </div>
    </header>
  );
}

