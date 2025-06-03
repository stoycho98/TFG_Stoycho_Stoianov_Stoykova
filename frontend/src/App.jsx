import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Header from './commons/Header';
import Footer from './commons/Footer';
import FormularioLogin from './components/FormularioLogin';
import PisosPublico from './components/PisosPublico';
import FormularioRegistro from './components/FormularioRegistro';
import FormularioPiso from './components/FormularioPiso';
import MisPisos from './components/MisPisos';
import FormularioReserva from './components/FormularioReserva';
import FormularioPago from './components/FormularioPago';
import FormularioPerfil from './components/FormularioPerfil';
import PanelSuperadmin from './components/PanelSuperadmin';
import AvisoLegal from './commons/AvisoLegal';
import PoliticaPrivacidad from './commons/PoliticaPrivacidad';
import TerminosCondiciones from './commons/TerminosCondiciones';

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

function ContenidoApp() {
  const [usuario, setUsuario] = useState(null);
  const [pisos, setPisos] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(() =>
    localStorage.getItem('modoOscuro') !== 'false'
  );
  const [isLoading, setIsLoading] = useState(true);

  const navegar = useNavigate();

  const cerrarSesion = (expirada = false) => {
    localStorage.clear();
    if (expirada) localStorage.setItem('sesionExpirada', '1');
    delete axios.defaults.headers.common['Authorization'];
    setUsuario(null);
    setPisos([]);
    navegar('/login');
  };

  useEffect(() => {
    document.body.classList.toggle('modo-oscuro', modoOscuro);
    document.body.classList.toggle('modo-dia', !modoOscuro);
    localStorage.setItem('modoOscuro', modoOscuro);
  }, [modoOscuro]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      respuesta => respuesta,
      error => {
        if (error.response && error.response.status === 401) {
          cerrarSesion(true);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const cargarPisos = () => {
    axios.get('/pisos')
      .then(res => setPisos(res.data))
      .catch(err => console.error('Error al cargar pisos:', err));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const guardado = localStorage.getItem('usuario');
    if (guardado) {
      const u = JSON.parse(guardado);
      setUsuario(u);
    }
    cargarPisos();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (usuario) cargarPisos();
  }, [usuario]);

  const onLoginExitoso = userData => {
    setUsuario(userData);
    localStorage.setItem('usuario', JSON.stringify(userData));
    navegar('/reservas');
  };

  const onRegisterExitoso = () => navegar('/login');
  const cuandoPisoCreado = () => cargarPisos();

  const misPisos = usuario ? pisos.filter(p => p.id_anfitrion === usuario.id) : [];
  const pisosDisponibles = usuario ? pisos.filter(p => p.id_anfitrion !== usuario.id) : [];

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Cargando...</div>;

  return (
    <>
      <Header
        usuario={usuario}
        onLogout={cerrarSesion}
        modoOscuro={modoOscuro}
        setModoOscuro={setModoOscuro}
      />
      <main className="container py-4" style={{ marginTop: '70px' }}>
        <Routes>
          <Route path="/" element={<PisosPublico pisos={pisos} />} />
          <Route path="/terminos" element={<TerminosCondiciones />} />
          <Route path="/privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/aviso" element={<AvisoLegal />} />

          <Route path="/login" element={!usuario ? <FormularioLogin onLoginExitoso={onLoginExitoso} switchToRegister={() => navegar('/register')} /> : <Navigate to="/reservas" />} />
          <Route path="/register" element={!usuario ? <FormularioRegistro onRegisterSuccess={onRegisterExitoso} switchToLogin={() => navegar('/login')} /> : <Navigate to="/reservas" />} />

          <Route path="/mis-pisos" element={usuario ? <MisPisos pisos={misPisos} /> : <Navigate to="/login" />} />
          <Route path="/crear-piso" element={usuario ? <FormularioPiso usuario={usuario} onPisoCreado={cuandoPisoCreado} /> : <Navigate to="/login" />} />
          <Route path="/reservas" element={usuario ? <FormularioReserva pisos={pisosDisponibles} /> : <Navigate to="/login" />} />
          <Route path="/mis-pagos" element={usuario ? <FormularioPago /> : <Navigate to="/login" />} />
          <Route path="/perfil" element={usuario ? (
            <FormularioPerfil
              usuario={usuario}
              onPerfilActualizado={perfil => {
                setUsuario(perfil);
                localStorage.setItem('usuario', JSON.stringify(perfil));
              }}
            />
          ) : <Navigate to="/login" />} />
          <Route path="/superadmin" element={usuario && usuario.id_rol === 3 ? <PanelSuperadmin /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ContenidoApp />
    </Router>
  );
}
